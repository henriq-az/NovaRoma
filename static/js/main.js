/* =========================================
   NOVA ROMA - LÓGICA PRINCIPAL
   ========================================= */

let menuOpen = false;

/**
 * Abre/fecha menu mobile
 */
function toggleMenu() {
  menuOpen = !menuOpen;
  const mobileMenu = document.getElementById('mobile-menu');
  const menuToggle = document.getElementById('menu-toggle');

  if (mobileMenu) {
    mobileMenu.classList.toggle('open', menuOpen);
  }
  if (menuToggle) {
    menuToggle.classList.toggle('active', menuOpen);
  }
}

/**
 * Exibe notificação toast
 * @param {string} msg - Mensagem a exibir
 */
function toast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;

  t.textContent = msg;
  t.classList.add('show');

  setTimeout(() => {
    t.classList.remove('show');
  }, 2400);
}

/**
 * Inscrição na newsletter
 */
function subscribe() {
  const inp = document.getElementById('nl-email');
  if (!inp) return;

  const email = inp.value.trim();

  if (email.includes('@')) {
    toast('Inscrito com sucesso!');
    inp.value = '';
  } else {
    toast('Digite um email válido.');
  }
}

/**
 * Inicialização geral da página
 */
function init() {
  console.log('Nova Roma - Sistema carregado');

  // Fecha menu mobile ao clicar em links
  const mobileLinks = document.querySelectorAll('.mobile-menu a');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (menuOpen) toggleMenu();
    });
  });

  // Fecha carrinho ao clicar no overlay
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      if (cartOpen) toggleCart();
    });
  }
}

// Executa ao carregar o DOM
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', init);
}
