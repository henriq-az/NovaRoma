# NOVA ROMA — Streetwear Pernambucano

E-commerce de camisetas streetwear inspiradas nos três grandes clubes de futebol de Pernambuco: Sport, Náutico e Santa Cruz.

## 📁 Estrutura do Projeto

```
/
├── index.html              # Página principal (vitrine)
├── produto.html            # Página de detalhe do produto
├── carrinho.html           # Carrinho de compras
├── checkout.html           # Finalizar pedido
│
├── assets/
│   ├── css/
│   │   ├── style.css       # Estilos globais (reset, variáveis, layout)
│   │   └── components.css  # Componentes (nav, botões, cards, carrinho)
│   ├── js/
│   │   ├── main.js         # Lógica geral (toast, menu mobile, init)
│   │   ├── carrinho.js     # Gerenciamento do carrinho
│   │   └── produtos.js     # Catálogo e filtros de produtos
│   └── images/
│       ├── produtos/       # Fotos das camisas (placeholder)
│       └── logo.png        # Logomarca Nova Roma
│
└── data/
    └── produtos.json       # Catálogo completo de produtos
```

## 🎨 Design System

### Paleta de Cores

```css
--brown:       #6B3F1F  /* Marrom principal */
--brown-dark:  #3D2010  /* Marrom escuro */
--brown-light: #C49A6C  /* Marrom claro */
--brown-pale:  #F0E4D0  /* Bege */
--black:       #111010  /* Preto */
--white:       #FFFFFF  /* Branco */
--text-dark:   #1a1714  /* Texto escuro */
--text-muted:  #9a8878  /* Texto secundário */
```

### Fontes

- **DM Serif Display**: Títulos principais
- **Economica**: Corpo de texto, botões, labels
- **Jost**: Logo e elementos de destaque

## 🚀 Funcionalidades

### Página Principal (index.html)
- Hero section com animações
- Ticker de clubes animado
- Grid de produtos com filtros por clube
- Sistema de adicionar ao carrinho
- Seção de clubes
- Manifesto da marca
- Newsletter
- Footer completo

### Página de Produto (produto.html)
- Galeria de imagens
- Informações detalhadas do produto
- Seletor de tamanhos
- Características e cuidados
- Botão de adicionar ao carrinho

### Página do Carrinho (carrinho.html)
- Lista completa de itens
- Quantidade e valores
- Cálculo de frete (grátis acima de R$ 300)
- Resumo do pedido
- Botões para continuar comprando ou finalizar

### Página de Checkout (checkout.html)
- Formulário de dados pessoais
- Formulário de endereço de entrega
- Seleção de forma de pagamento (PIX, Boleto, Cartão)
- Resumo do pedido
- Validação de formulário

## 💻 JavaScript

### carrinho.js
Gerencia toda a lógica do carrinho:
- `toggleCart()` - Abre/fecha carrinho lateral
- `add()` - Adiciona produto ao carrinho
- `remove()` - Remove produto do carrinho
- `renderCart()` - Atualiza interface do carrinho
- `checkout()` - Redireciona para página de checkout

### produtos.js
Gerencia produtos e filtros:
- `filter()` - Filtra produtos por clube
- `getProdutoById()` - Busca produto por ID
- `loadProdutos()` - Carrega produtos do JSON (futuro)
- Dados dos produtos (array PRODUTOS)

### main.js
Lógica geral da aplicação:
- `toggleMenu()` - Menu mobile
- `toast()` - Notificações
- `subscribe()` - Newsletter
- `init()` - Inicialização

## 📦 Dados dos Produtos

O arquivo `data/produtos.json` contém todos os produtos com:
- ID único
- Nome, clube, preço
- Descrição completa
- Tamanhos disponíveis
- Características
- Instruções de cuidados

### Produtos Disponíveis:
1. **Leão Noir** - Sport (R$ 259)
2. **Timbu Branco** - Náutico (R$ 239)
3. **Tricolor Day** - Santa Cruz (R$ 249)
4. **Rubro Clássico** - Sport (R$ 269)
5. **Timbu Noir** - Náutico (R$ 279)
6. **Santa Cruz Dark** - Santa Cruz (R$ 259)

## 🎯 Clubes

### Sport Club do Recife
- Cores: Rubro-negro (#CC0000)
- Ícone: 🦁
- Fundado: 1905

### Clube Náutico Capibaribe
- Cores: Alvigrená (#7B1C3B)
- Ícone: ⚓
- Fundado: 1901

### Santa Cruz Futebol Clube
- Cores: Tricolor (#E8000B)
- Ícone: 🦈
- Fundado: 1914

## 📱 Responsivo

O projeto é totalmente responsivo com breakpoint principal em 900px:
- Menu hambúrguer em mobile
- Grid adaptável de produtos
- Carrinho em tela cheia em mobile
- Formulários adaptados para mobile

## 🔧 Como Usar

1. Abra `index.html` no navegador
2. Navegue pela coleção de produtos
3. Filtre por clube (Sport, Náutico, Santa Cruz)
4. Adicione produtos ao carrinho
5. Finalize o pedido em checkout.html

## 📝 Notas Técnicas

- **CSS Modular**: Separado em style.css (global) e components.css (componentes)
- **JavaScript Modular**: Separado por funcionalidade
- **LocalStorage**: Possível implementar para persistir carrinho
- **API**: Pronto para integração com backend
- **Imagens**: SVGs inline para produtos (placeholder), pronto para receber imagens reais

## 🚧 Melhorias Futuras

- [ ] Integração com API de produtos
- [ ] Integração com gateway de pagamento
- [ ] Sistema de busca
- [ ] Wishlist
- [ ] Login/Cadastro de usuários
- [ ] Histórico de pedidos
- [ ] Sistema de reviews
- [ ] Carrinho persistente (localStorage)
- [ ] Fotos reais dos produtos
- [ ] Zoom em imagens de produto
- [ ] Mais variações de tamanho e cor

## 📄 Licença

© 2025 Nova Roma — Todos os direitos reservados

---

**Desenvolvido com ❤️ em Recife, PE**
