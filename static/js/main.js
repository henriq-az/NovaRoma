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

/* ── POLAROID SLIDESHOW ──
   As fotos são lidas automaticamente da pasta:
   static/images/carrosel/
   Basta adicionar imagens lá e reiniciar o servidor.
   ─────────────────────────────────────────────── */
function initPolaroidById(slidesId, dotsId) {
  var slidesEl = document.getElementById(slidesId);
  var dotsEl   = document.getElementById(dotsId);
  if (!slidesEl || !dotsEl) return;

  var slides = slidesEl.querySelectorAll('.polaroid-slide');
  if (slides.length <= 1) return;

  var current = 0;

  slides.forEach(function(_, i) {
    var dot = document.createElement('button');
    dot.className = 'polaroid-dot' + (i === 0 ? ' active' : '');
    (function(n) {
      dot.addEventListener('click', function() { goTo(n); });
    })(i);
    dotsEl.appendChild(dot);
  });

  var dots = dotsEl.querySelectorAll('.polaroid-dot');

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  setInterval(function() { goTo(current + 1); }, 3600);
}

function initPolaroid() {
  initPolaroidById('polaroid-slides', 'polaroid-dots');
  initPolaroidById('polaroid-slides-mobile', 'polaroid-dots-mobile');
}

/**
 * Inicialização geral da página
 */
function init() {
  console.log('Nova Roma - Sistema carregado');
  initPolaroid();

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
