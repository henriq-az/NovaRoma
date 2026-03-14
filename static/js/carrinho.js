/* =========================================
   NOVA ROMA - GERENCIAMENTO DO CARRINHO
   ========================================= */

let cart = [];
let cartOpen = false;

/**
 * Abre/fecha o carrinho lateral
 */
function toggleCart() {
  cartOpen = !cartOpen;
  document.getElementById('sidebar').classList.toggle('open', cartOpen);
  document.getElementById('overlay').classList.toggle('show', cartOpen);
}

/**
 * Adiciona produto ao carrinho
 * @param {string} name - Nome do produto
 * @param {string} club - Clube (identificadores: sport, náutico, santa cruz)
 * @param {number} price - Preço do produto
 */
function add(name, club, price) {
  const ex = cart.find(i => i.name === name);
  if (ex) {
    ex.qty++;
  } else {
    const icons = { sport:'🦁', náutico:'⚓', 'santa cruz':'🦈' };
    cart.push({
      name,
      club,
      price,
      qty: 1,
      icon: icons[club] || '👕'
    });
  }
  renderCart();
  toast(`${name} adicionado!`);
}

/**
 * Remove produto do carrinho
 * @param {string} name - Nome do produto a remover
 */
function remove(name) {
  cart = cart.filter(i => i.name !== name);
  renderCart();
}

/**
 * Renderiza o carrinho na interface
 */
function renderCart() {
  const n = cart.reduce((s, i) => s + i.qty, 0);

  // Atualiza contadores
  document.getElementById('cart-count').textContent = n;
  const mobileCount = document.getElementById('mobile-cart-count');
  if (mobileCount) {
    mobileCount.textContent = n;
  }

  const el = document.getElementById('cart-items');
  const ftr = document.getElementById('cart-ftr');

  // Se carrinho vazio
  if (!cart.length) {
    el.innerHTML = '<div class="cart-empty">Seu carrinho está vazio.</div>';
    ftr.style.display = 'none';
    return;
  }

  // Exibe footer com total
  ftr.style.display = 'block';

  // Calcula total
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  document.getElementById('cart-total').textContent = 'R$\u00A0' + total.toLocaleString('pt-BR', {minimumFractionDigits: 2});

  // Renderiza itens
  el.innerHTML = cart.map(i => `
    <div class="cart-item">
      <div class="cart-item-thumb">${i.icon}</div>
      <div class="cart-item-info">
        <p class="cart-item-name">${i.name}</p>
        <p class="cart-item-sub">${i.club.toUpperCase()} · QTD: ${i.qty}</p>
      </div>
      <span class="cart-item-price">R$\u00A0${(i.price * i.qty).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
      <button class="cart-rm" onclick="remove('${i.name}')">✕</button>
    </div>
  `).join('');
}

/**
 * Finaliza a compra
 */
function checkout() {
  if (cart.length === 0) {
    toast('Seu carrinho está vazio!');
    return;
  }

  // Redireciona para página de checkout
  window.location.href = 'checkout.html';
}

// Inicializa carrinho vazio ao carregar
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    renderCart();
  });
}
