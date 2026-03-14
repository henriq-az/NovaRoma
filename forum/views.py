from django.shortcuts import render, redirect, get_object_or_404
from .models import Produto, FotoProduto


def index(request):
    produtos = Produto.objects.prefetch_related('fotos').all()
    return render(request, 'index.html', {'produtos': produtos})


def produto_detalhe(request, pk):
    produto = get_object_or_404(Produto, pk=pk)
    return render(request, 'produto_detalhe.html', {'produto': produto})


def adeeme(request):
    produtos = Produto.objects.prefetch_related('fotos').all()
    return render(request, 'adeeme/index.html', {'produtos': produtos})


def adeeme_criar(request):
    if request.method == 'POST':
        titulo = request.POST.get('titulo', '').strip()
        preco = request.POST.get('preco', '0').replace(',', '.')
        descricao = request.POST.get('descricao', '').strip()
        produto = Produto.objects.create(titulo=titulo, preco=preco, descricao=descricao)
        for i, foto in enumerate(request.FILES.getlist('fotos')):
            FotoProduto.objects.create(produto=produto, foto=foto, ordem=i)
        return redirect('adeeme')
    return render(request, 'adeeme/form.html', {'produto': None})


def adeeme_editar(request, pk):
    produto = get_object_or_404(Produto, pk=pk)
    if request.method == 'POST':
        produto.titulo = request.POST.get('titulo', '').strip()
        produto.preco = request.POST.get('preco', '0').replace(',', '.')
        produto.descricao = request.POST.get('descricao', '').strip()
        produto.save()
        fotos_deletar = request.POST.getlist('deletar_foto')
        if fotos_deletar:
            FotoProduto.objects.filter(pk__in=fotos_deletar, produto=produto).delete()
        novas = request.FILES.getlist('fotos')
        offset = produto.fotos.count()
        for i, foto in enumerate(novas):
            FotoProduto.objects.create(produto=produto, foto=foto, ordem=offset + i)
        return redirect('adeeme')
    return render(request, 'adeeme/form.html', {'produto': produto})


def adeeme_deletar(request, pk):
    produto = get_object_or_404(Produto, pk=pk)
    produto.delete()
    return redirect('adeeme')
