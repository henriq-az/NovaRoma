from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('produto/<int:pk>/', views.produto_detalhe, name='produto_detalhe'),
    path('adeeme/', views.adeeme, name='adeeme'),
    path('adeeme/criar/', views.adeeme_criar, name='adeeme_criar'),
    path('adeeme/editar/<int:pk>/', views.adeeme_editar, name='adeeme_editar'),
    path('adeeme/deletar/<int:pk>/', views.adeeme_deletar, name='adeeme_deletar'),
    path('adeeme/estoque/<int:pk>/', views.adeeme_estoque, name='adeeme_estoque'),
]
