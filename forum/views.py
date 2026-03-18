import os
from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from django.templatetags.static import static
from .models import Produto, FotoProduto, EstoqueItem


def index(request):
    produtos = Produto.objects.prefetch_related('fotos').all()

    carrosel_dir = os.path.join(settings.BASE_DIR, 'static', 'images', 'carrosel')
    carrosel_fotos = []
    if os.path.exists(carrosel_dir):
        extensoes = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
        for fname in sorted(os.listdir(carrosel_dir)):
            if os.path.splitext(fname)[1].lower() in extensoes:
                carrosel_fotos.append(static(f'images/carrosel/{fname}'))

    return render(request, 'index.html', {'produtos': produtos, 'carrosel_fotos': carrosel_fotos})


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

        # Salva a nova ordem de cada foto
        for foto in produto.fotos.all():
            nova_ordem = request.POST.get(f'ordem_{foto.pk}')
            if nova_ordem is not None:
                foto.ordem = int(nova_ordem)
                foto.save(update_fields=['ordem'])

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


def adeeme_estoque(request, pk):
    produto = get_object_or_404(Produto, pk=pk)
    tamanhos = ['PP', 'P', 'M', 'G', 'GG', 'XG']

    # Garante que existe um EstoqueItem para cada tamanho
    for t in tamanhos:
        EstoqueItem.objects.get_or_create(produto=produto, tamanho=t)

    if request.method == 'POST':
        acao = request.POST.get('acao')  # 'entrada' ou 'saida'
        for t in tamanhos:
            val = request.POST.get(f'qty_{t}', '').strip()
            if not val:
                continue
            try:
                qty = int(val)
            except ValueError:
                continue
            if qty <= 0:
                continue
            item = EstoqueItem.objects.get(produto=produto, tamanho=t)
            if acao == 'entrada':
                item.quantidade += qty
            elif acao == 'saida':
                item.quantidade = max(0, item.quantidade - qty)
            item.save()
        return redirect('adeeme_estoque', pk=pk)

    itens = produto.estoque.all()
    return render(request, 'adeeme/estoque.html', {'produto': produto, 'itens': itens})
