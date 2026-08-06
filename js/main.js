/* =========================================================================
   NOVRA — Noyau du site
   Header / footer partagés, menu mobile, recherche, mini-panier,
   notifications, animations au scroll, cartes produits.
   ========================================================================= */

const INSTAGRAM_URL = 'https://www.instagram.com/novra_officiel/';

/* ------------------------------- Icônes --------------------------------- */
const ICONS = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5S20 17 20 21"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 5l-7 7 7 7"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5l7 7-7 7"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
  filter: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M6 12h12M10 18h4"/></svg>'
};

/* ------------------------- Header & footer partagés ---------------------- */
const NAV_LINKS = [
  { href: 'index.html', label: 'Accueil', key: 'home' },
  { href: 'marketplace.html', label: 'Shop', key: 'shop' },
  { href: 'marketplace.html?gender=homme', label: 'Homme', key: 'homme' },
  { href: 'marketplace.html?gender=femme', label: 'Femme', key: 'femme' },
  { href: 'marketplace.html?category=accessoires', label: 'Accessoires', key: 'accessoires' },
  { href: 'about.html', label: 'Notre mission', key: 'about' },
  { href: 'contact.html', label: 'Contact', key: 'contact' }
];

function renderHeader() {
  const root = document.getElementById('header-root');
  if (!root) return;
  const active = document.body.dataset.page || '';
  const solid = document.body.classList.contains('has-solid-header');

  const nav = NAV_LINKS.map(function (l) {
    const cur = l.key === active ? ' aria-current="page"' : '';
    return '<a href="' + l.href + '"' + cur + '>' + l.label + '</a>';
  }).join('');

  root.innerHTML = '' +
    '<header class="site-header' + (solid ? ' is-solid' : '') + '" id="site-header">' +
      '<div class="container">' +
        '<a class="brand" href="index.html" aria-label="NOVRA — accueil">' +
          '<img src="assets/web/logo/novra-wordmark-sm.png" alt="NOVRA" width="121" height="17">' +
        '</a>' +
        '<nav class="main-nav" aria-label="Navigation principale">' + nav + '</nav>' +
        '<div class="header-actions">' +
          '<button class="icon-btn" type="button" data-open-search aria-label="Rechercher un produit">' + ICONS.search + '</button>' +
          '<a class="icon-btn" href="contact.html" aria-label="Espace client">' + ICONS.user + '</a>' +
          '<button class="icon-btn" type="button" data-open-cart aria-label="Ouvrir le panier">' + ICONS.bag +
            '<span class="cart-count" data-cart-count aria-hidden="true">0</span></button>' +
          '<button class="burger" type="button" data-burger aria-label="Ouvrir le menu" aria-expanded="false">' +
            '<span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
    '</header>' +

    '<div class="mobile-menu" id="mobile-menu">' +
      '<nav aria-label="Navigation mobile">' +
        NAV_LINKS.map(function (l) { return '<a href="' + l.href + '">' + l.label + '</a>'; }).join('') +
      '</nav>' +
      '<div class="mobile-menu-footer">' +
        '<a class="btn btn-light" href="marketplace.html">Découvrir la collection</a>' +
        '<div class="mobile-social">' +
          '<a href="' + INSTAGRAM_URL + '" target="_blank" rel="noopener" aria-label="Instagram NOVRA">' + ICONS.instagram + '</a>' +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div class="search-panel" id="search-panel">' +
      '<form role="search" action="marketplace.html" method="get">' +
        '<label class="sr-only" for="global-search">Rechercher</label>' +
        '<input type="search" id="global-search" name="q" placeholder="Rechercher un produit…" autocomplete="off">' +
        '<button class="icon-btn" type="submit" aria-label="Lancer la recherche">' + ICONS.search + '</button>' +
        '<button class="icon-btn" type="button" data-close-search aria-label="Fermer la recherche">' + ICONS.close + '</button>' +
      '</form>' +
    '</div>' +

    '<div class="cart-backdrop" data-close-cart></div>' +
    '<aside class="cart-drawer" id="cart-drawer" aria-label="Panier" aria-hidden="true">' +
      '<div class="cart-drawer-head">' +
        '<h2>Panier</h2>' +
        '<button class="icon-btn" type="button" data-close-cart aria-label="Fermer le panier" style="color:var(--black)">' + ICONS.close + '</button>' +
      '</div>' +
      '<div class="cart-drawer-body" id="cart-drawer-body"></div>' +
      '<div class="cart-drawer-foot" id="cart-drawer-foot"></div>' +
    '</aside>';
}

function renderFooter() {
  const root = document.getElementById('footer-root');
  if (!root) return;

  const cols = [
    { title: 'Marketplace', links: [
      ['marketplace.html?gender=homme', 'Homme'],
      ['marketplace.html?gender=femme', 'Femme'],
      ['marketplace.html?category=accessoires', 'Accessoires'],
      ['marketplace.html?new=1', 'Nouveautés']
    ]},
    { title: 'La marque', links: [
      ['about.html', 'À propos'],
      ['about.html#mission', 'Notre mission'],
      ['about.html#technologies', 'Technologies'],
      ['about.html#engagement', 'Engagement']
    ]},
    { title: 'Aide', links: [
      ['contact.html#livraison', 'Livraison et retours'],
      ['contact.html#tailles', 'Guide des tailles'],
      ['contact.html#faq', 'FAQ'],
      ['contact.html', 'Nous contacter']
    ]},
    { title: 'Informations', links: [
      ['mentions-legales.html', 'Mentions légales'],
      ['politique-confidentialite.html', 'Politique de confidentialité'],
      ['cgv.html', 'Conditions générales de vente']
    ]}
  ];

  root.innerHTML = '' +
    '<footer class="site-footer">' +
      '<div class="container">' +
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            '<img src="assets/web/logo/novra-wordmark.png" alt="NOVRA" width="150" height="21" loading="lazy">' +
            '<p>Équipements techniques conçus pour la performance. Chaque jour, chaque rep, chaque pas.</p>' +
          '</div>' +
          cols.map(function (c) {
            return '<div class="footer-col"><h3>' + c.title + '</h3>' +
              c.links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + '</a>'; }).join('') +
            '</div>';
          }).join('') +
        '</div>' +
        '<div class="footer-bottom">' +
          '<p>© ' + new Date().getFullYear() + ' NOVRA. Tous droits réservés.</p>' +
          '<div class="social">' +
            '<a href="' + INSTAGRAM_URL + '" target="_blank" rel="noopener" aria-label="Instagram NOVRA">' + ICONS.instagram + '</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</footer>';
}

/* ---------------------------- Notifications ------------------------------ */
function notify(message, image, isError) {
  let stack = document.querySelector('.toast-stack');
  if (!stack) {
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    stack.setAttribute('role', 'status');
    stack.setAttribute('aria-live', 'polite');
    document.body.appendChild(stack);
  }
  const toast = document.createElement('div');
  toast.className = 'toast' + (isError ? ' is-error' : '');
  toast.innerHTML = (image ? '<img src="' + image + '" alt="" width="42" height="56">' : '') + '<span>' + message + '</span>';
  stack.appendChild(toast);
  requestAnimationFrame(function () { toast.classList.add('is-visible'); });
  setTimeout(function () {
    toast.classList.remove('is-visible');
    setTimeout(function () { toast.remove(); }, 400);
  }, 3200);
}

/* ------------------------------ Overlays --------------------------------- */
const Overlay = {
  lock() { document.body.classList.add('no-scroll'); },
  unlock() {
    if (!document.querySelector('.mobile-menu.is-open, .cart-drawer.is-open, .filters.is-open, .modal.is-open')) {
      document.body.classList.remove('no-scroll');
    }
  },
  closeAll() {
    document.querySelectorAll('.mobile-menu.is-open, .cart-drawer.is-open, .cart-backdrop.is-open, .search-panel.is-open, .filters.is-open, .modal.is-open')
      .forEach(function (el) { el.classList.remove('is-open'); });
    const burger = document.querySelector('[data-burger]');
    if (burger) { burger.classList.remove('is-active'); burger.setAttribute('aria-expanded', 'false'); }
    document.body.classList.remove('no-scroll');
  }
};

function openCart() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.querySelector('.cart-backdrop');
  if (!drawer) return;
  renderCartDrawer();
  drawer.classList.add('is-open');
  drawer.setAttribute('aria-hidden', 'false');
  if (backdrop) backdrop.classList.add('is-open');
  Overlay.lock();
}

function closeCart() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.querySelector('.cart-backdrop');
  if (drawer) { drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true'); }
  if (backdrop) backdrop.classList.remove('is-open');
  Overlay.unlock();
}

/* --------------------------- Cartes produits ----------------------------- */
function stars(rating) {
  const full = Math.round(rating);
  let out = '';
  for (let i = 1; i <= 5; i++) out += i <= full ? '★' : '☆';
  return out;
}

function productCardMarkup(p, options) {
  const opts = options || {};
  const alt = p.images[1] || p.images[0];
  const badge = p.newProduct ? '<span class="product-badge">Nouveauté</span>' : '';
  const swatches = p.colors.map(function (c) {
    return '<span class="swatch" style="background:' + colorSwatch(c) + '" title="' + c + '"></span>';
  }).join('');

  return '' +
    '<article class="product-card" data-reveal data-delay="' + ((opts.index || 0) % 4 + 1) + '">' +
      '<div class="product-media-wrap">' +
        '<a class="product-media" href="product.html?id=' + p.id + '" aria-label="' + p.name + '">' +
          badge +
          '<img class="is-main" src="' + p.images[0] + '" alt="' + p.name + '" width="600" height="800" loading="lazy" decoding="async">' +
          '<img class="is-alt" src="' + alt + '" alt="" width="600" height="800" loading="lazy" decoding="async" aria-hidden="true">' +
        '</a>' +
        '<div class="product-quick">' +
          '<button class="btn" type="button" data-quick-add="' + p.id + '">Ajout rapide</button>' +
        '</div>' +
      '</div>' +
      '<div class="product-info">' +
        '<span class="product-cat">' + p.categoryLabel + '</span>' +
        '<h3 class="product-name"><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' +
        '<span class="product-price">' + formatPrice(p.price) + '</span>' +
        '<div class="product-colors">' + swatches + '</div>' +
        '<div class="product-rating"><span class="stars">' + stars(p.rating) + '</span><span>(' + p.reviews + ')</span></div>' +
      '</div>' +
    '</article>';
}

/* Ajout rapide : va à la fiche si une taille doit être choisie */
function handleQuickAdd(id) {
  const p = getProductById(id);
  if (!p) return;
  if (p.sizes.length > 1) {
    window.location.href = 'product.html?id=' + p.id;
    return;
  }
  Cart.add(p.id, p.sizes[0], p.colors[0], 1);
  notify(p.name + ' ajouté au panier', p.images[0]);
  openCart();
}

/* --------------------------- Animations scroll --------------------------- */
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]:not(.is-visible)');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: .12 });
  items.forEach(function (el) { io.observe(el); });
}

function initParallax() {
  const items = document.querySelectorAll('[data-parallax]');
  if (!items.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let ticking = false;
  function update() {
    items.forEach(function (el) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const speed = parseFloat(el.dataset.parallax) || .12;
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
      el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

/* -------------------------------- Header --------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('site-header');
  if (!header || header.classList.contains('is-solid')) return;
  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ------------------------------- Carrousel -------------------------------- */
function initCarousels() {
  document.querySelectorAll('[data-carousel]').forEach(function (wrap) {
    const track = wrap.querySelector('.carousel');
    const prev = wrap.querySelector('[data-carousel-prev]');
    const next = wrap.querySelector('[data-carousel-next]');
    if (!track) return;
    const step = function () { return Math.max(240, track.clientWidth * .6); };
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  });
}

/* ------------------------------ Accordéons -------------------------------- */
function initAccordions() {
  document.querySelectorAll('.accordion-trigger').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const panel = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (panel) panel.style.maxHeight = open ? '0px' : panel.scrollHeight + 'px';
    });
  });
}

/* ------------------------------ Newsletter -------------------------------- */
function initNewsletter() {
  const form = document.getElementById('newsletter-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const feedback = form.parentElement.querySelector('.form-feedback');
    const value = (input.value || '').trim();
    const valid = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value);
    if (!feedback) return;
    if (!valid) {
      feedback.textContent = 'Merci de saisir une adresse e-mail valide.';
      feedback.className = 'form-feedback is-error';
      input.focus();
      return;
    }
    feedback.textContent = 'Inscription enregistrée. Bienvenue dans le mouvement NOVRA.';
    feedback.className = 'form-feedback is-ok';
    form.reset();
  });
}

/* ---------------------------- Vidéo de secours ---------------------------- */
function initHeroVideo() {
  const video = document.querySelector('.hero-video');
  if (!video) return;

  /* iOS : lecture intégrée, muette, en boucle, sans interface native */
  video.muted = true;
  video.defaultMuted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.removeAttribute('controls');

  const tryToPlay = function () {
    const playPromise = video.play();
    if (playPromise !== undefined && typeof playPromise.catch === 'function') {
      /* Lecture refusée (économie d'énergie, préférences système) :
         le poster NOVRA reste affiché, aucun bouton Play n'est ajouté. */
      playPromise.catch(function () {});
    }
  };

  if (video.readyState >= 2) {
    tryToPlay();
  } else {
    video.addEventListener('loadeddata', tryToPlay, { once: true });
    video.addEventListener('canplay', tryToPlay, { once: true });
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && video.paused) tryToPlay();
  });

  window.addEventListener('pageshow', function () {
    if (video.paused) tryToPlay();
  });

  /* Si le fichier est illisible, on retombe sur le poster en image fixe */
  video.addEventListener('error', function () {
    const poster = video.getAttribute('poster');
    if (!poster) return;
    const img = document.createElement('img');
    img.src = poster;
    img.alt = '';
    video.replaceWith(img);
  });
}

/* --------------------------------- Init ---------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  renderHeader();
  renderFooter();
  updateCartCount();
  renderCartDrawer();
  bindCartLineEvents(document.getElementById('cart-drawer-body'));

  initHeaderScroll();
  initReveal();
  initParallax();
  initCarousels();
  initAccordions();
  initNewsletter();
  initHeroVideo();

  /* Délégation globale */
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-cart]')) { e.preventDefault(); openCart(); return; }
    if (e.target.closest('[data-close-cart]')) { closeCart(); return; }

    if (e.target.closest('[data-open-search]')) {
      const panel = document.getElementById('search-panel');
      if (panel) {
        panel.classList.add('is-open');
        const input = panel.querySelector('input');
        if (input) setTimeout(function () { input.focus(); }, 120);
      }
      return;
    }
    if (e.target.closest('[data-close-search]')) {
      const panel = document.getElementById('search-panel');
      if (panel) panel.classList.remove('is-open');
      return;
    }

    const burger = e.target.closest('[data-burger]');
    if (burger) {
      const menu = document.getElementById('mobile-menu');
      const open = menu.classList.toggle('is-open');
      burger.classList.toggle('is-active', open);
      burger.setAttribute('aria-expanded', String(open));
      if (open) Overlay.lock(); else Overlay.unlock();
      return;
    }

    const quick = e.target.closest('[data-quick-add]');
    if (quick) { handleQuickAdd(quick.dataset.quickAdd); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') Overlay.closeAll();
  });

  /* Fermer le menu mobile lors d'un clic sur un lien */
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) Overlay.closeAll();
    });
  }
});
