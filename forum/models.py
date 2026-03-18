from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal


class Categoria(models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Categoria'
        verbose_name_plural = 'Categorias'

    def __str__(self):
        return self.nome


class Topico(models.Model):
    titulo = models.CharField(max_length=200)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, related_name='topicos')
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='topicos')
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Tópico'
        verbose_name_plural = 'Tópicos'
        ordering = ['-criado_em']

    def __str__(self):
        return self.titulo


class Post(models.Model):
    topico = models.ForeignKey(Topico, on_delete=models.CASCADE, related_name='posts')
    autor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    conteudo = models.TextField()
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Post'
        verbose_name_plural = 'Posts'
        ordering = ['criado_em']

    def __str__(self):
        return f'Post de {self.autor} em {self.topico}'


class Produto(models.Model):
    titulo = models.CharField(max_length=200)
    preco = models.DecimalField(max_digits=8, decimal_places=2)
    descricao = models.TextField(blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Produto'
        verbose_name_plural = 'Produtos'
        ordering = ['-criado_em']

    def __str__(self):
        return self.titulo


class FotoProduto(models.Model):
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, related_name='fotos')
    foto = models.ImageField(upload_to='produtos/')
    ordem = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['ordem', 'id']


class EstoqueItem(models.Model):
    TAMANHOS = [
        ('PP', 'PP'), ('P', 'P'), ('M', 'M'),
        ('G', 'G'), ('GG', 'GG'), ('XG', 'XG'),
    ]
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, related_name='estoque')
    tamanho = models.CharField(max_length=5, choices=TAMANHOS)
    quantidade = models.IntegerField(default=0)

    class Meta:
        unique_together = ('produto', 'tamanho')
        ordering = ['tamanho']

    def __str__(self):
        return f'{self.produto} — {self.tamanho}: {self.quantidade}'
