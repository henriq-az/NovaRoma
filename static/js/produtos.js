/* =========================================
   NOVA ROMA - PRODUTOS E FILTROS
   ========================================= */

/**
 * Filtra produtos por clube
 * @param {string} club - 'all', 'sport', 'nautico' ou 'santa' (identificadores técnicos)
 * @param {HTMLElement} btn - Botão clicado
 */
function filter(club, btn) {
  // Mostra/esconde produtos
  document.querySelectorAll('.product-card').forEach(c => {
    c.style.display = (club === 'all' || c.dataset.club === club) ? '' : 'none';
  });

  // Atualiza estados dos botões
  document.querySelectorAll('.filter-btn').forEach(b =>
    b.classList.remove('active', 'sport-a', 'nautico-a', 'santa-a')
  );

  if (btn) {
    const classMap = {
      all: 'active',
      sport: 'sport-a',
      nautico: 'nautico-a',
      santa: 'santa-a'
    };
    btn.classList.add(classMap[club] || 'active');
  }
}

/**
 * Dados dos produtos (temporário - será migrado para produtos.json)
 */
const PRODUTOS = [
  {
    id: 'leao-noir',
    name: 'Leão Noir',
    club: 'sport',
    clubFull: 'Leão',
    price: 259,
    oldPrice: null,
    badge: 'Novo',
    icon: '🦁',
    description: 'Camisa premium em preto com detalhes rubros. Design minimalista que celebra a tradição do Leão da Ilha.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['leao-noir-1.jpg', 'leao-noir-2.jpg']
  },
  {
    id: 'timbu-branco',
    name: 'Timbu Branco',
    club: 'nautico',
    clubFull: 'Timbu',
    price: 239,
    oldPrice: 289,
    badge: 'Drop',
    icon: '⚓',
    description: 'Camisa clássica nas listras grená e branca. Homenagem ao time mais tradicional do Norte-Nordeste.',
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    images: ['timbu-branco-1.jpg', 'timbu-branco-2.jpg']
  },
  {
    id: 'tricolor-day',
    name: 'Tricolor Day',
    club: 'santa',
    clubFull: 'Cobra Coral',
    price: 249,
    oldPrice: null,
    badge: 'Limited',
    icon: '🦈',
    description: 'Edição limitada com as cores do mais querido. Vermelho, branco e a garra coral.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['tricolor-day-1.jpg', 'tricolor-day-2.jpg']
  },
  {
    id: 'rubro-classico',
    name: 'Rubro Clássico',
    club: 'sport',
    clubFull: 'Leão',
    price: 269,
    oldPrice: null,
    badge: 'Novo',
    icon: '🦁',
    description: 'A essência rubro-negra em cada detalhe. Para os que vivem o Leão todos os dias.',
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    images: ['rubro-classico-1.jpg', 'rubro-classico-2.jpg']
  },
  {
    id: 'timbu-noir',
    name: 'Timbu Noir',
    club: 'nautico',
    clubFull: 'Timbu',
    price: 279,
    oldPrice: null,
    badge: 'Drop',
    icon: '⚓',
    description: 'Edição Dark com grená intenso. Design exclusivo para os alvigrená de coração.',
    sizes: ['P', 'M', 'G', 'GG'],
    images: ['timbu-noir-1.jpg', 'timbu-noir-2.jpg']
  },
  {
    id: 'santa-cruz-dark',
    name: 'Santa Cruz Dark',
    club: 'santa',
    clubFull: 'Cobra Coral',
    price: 259,
    oldPrice: 309,
    badge: 'Limited',
    icon: '🦈',
    description: 'Preto com detalhes vermelhos. Edição limitada para os apaixonados pelo Tricolor.',
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    images: ['santa-cruz-dark-1.jpg', 'santa-cruz-dark-2.jpg']
  }
];

/**
 * Busca produto por ID
 * @param {string} id - ID do produto
 * @returns {object|null} Dados do produto ou null
 */
function getProdutoById(id) {
  return PRODUTOS.find(p => p.id === id) || null;
}

/**
 * Carrega produtos de data/produtos.json (futuro)
 */
async function loadProdutos() {
  try {
    const response = await fetch('data/produtos.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Usando dados hardcoded de produtos');
  }
  return PRODUTOS;
}
