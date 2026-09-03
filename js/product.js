/* =========================================================================
   NOVRA — Fiche produit
   Lecture du paramètre ?id= et rendu complet de la page.
   ========================================================================= */

const pdp = { product: null, color: null, size: null, qty: 1 };

function pdpMarkup(p) {
  const thumbs = p.images.map(function (src, i) {
    return '<button type="button" class="' + (i === 0 ? 'is-active' : '') + '" data-thumb="' + i + '" aria-label="Visuel ' + (i + 1) + '">' +
      '<img src="' + src + '" alt="" width="84" height="112" loading="lazy"></button>';
  }).join('');

  const colors = p.colors.map(function (c, i) {
    return '<button type="button" class="color-dot' + (i === 0 ? ' is-active' : '') + '" data-color="' + c +
      '" style="background:' + colorSwatch(c) + '" aria-label="Couleur ' + c + '" title="' + c + '"></button>';
  }).join('');

  const sizes = p.sizes.map(function (s) {
    return '<button type="button" class="chip" data-size="' + s + '">' + s + '</button>';
  }).join('');

  const singleSize = p.sizes.length === 1;

  return '' +
  '<div class="gallery">' +
    '<div class="gallery-thumbs">' + thumbs + '</div>' +
    '<div class="gallery-main"><img id="pdp-main-image" src="' + p.images[0] + '" alt="' + p.name + '" width="900" height="1200" fetchpriority="high"></div>' +
  '</div>' +

  '<div class="pdp-details">' +
    '<span class="product-cat">' + p.categoryLabel + '</span>' +
    '<h1 class="pdp-title">' + p.name + '</h1>' +
    '<div class="product-rating" style="margin:0 0 14px"><span class="stars">' + stars(p.rating) + '</span><span>' + p.rating.toFixed(1) + ' — ' + p.reviews + ' avis</span></div>' +
    '<p class="pdp-price">' + formatPrice(p.price) + '</p>' +
    '<p class="pdp-desc">' + p.description + '</p>' +

    '<div class="option-block">' +
      '<div class="option-head"><h3>Couleur</h3><span id="pdp-color-label">' + p.colors[0] + '</span></div>' +
      '<div class="color-row" id="pdp-colors">' + colors + '</div>' +
    '</div>' +

    '<div class="option-block">' +
      '<div class="option-head"><h3>Taille</h3>' +
        '<button type="button" class="size-guide-link" data-open-size-guide>Guide des tailles</button></div>' +
      '<div class="chip-row" id="pdp-sizes">' + sizes + '</div>' +
      '<p class="field-error" id="pdp-size-error"></p>' +
    '</div>' +

    '<div class="option-block">' +
      '<div class="option-head"><h3>Quantité</h3></div>' +
      '<div class="qty">' +
        '<button type="button" data-qty="-1" aria-label="Diminuer la quantité">−</button>' +
        '<span id="pdp-qty">1</span>' +
        '<button type="button" data-qty="1" aria-label="Augmenter la quantité">+</button>' +
      '</div>' +
    '</div>' +

    '<div class="pdp-actions">' +
      '<button class="btn" type="button" id="pdp-add">Ajouter au panier</button>' +
    '</div>' +

    '<ul class="reassurance">' +
      '<li><svg viewBox="0 0 24 24"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17.5" cy="18" r="2"/></svg>Livraison rapide en 24-48 h</li>' +
      '<li><svg viewBox="0 0 24 24"><path d="M4 8a8 8 0 1 1 .6 6"/><path d="M3 4v5h5"/></svg>Retours gratuits sous 30 jours</li>' +
      '<li><svg viewBox="0 0 24 24"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>Paiement sécurisé</li>' +
    '</ul>' +

    '<div class="accordion">' +
      '<div class="accordion-item">' +
        '<button class="accordion-trigger" type="button" aria-expanded="false">Détails techniques<i></i></button>' +
        '<div class="accordion-panel"><div><ul>' +
          p.technicalDetails.map(function (d) { return '<li>' + d + '</li>'; }).join('') +
        '</ul></div></div>' +
      '</div>' +
      '<div class="accordion-item">' +
        '<button class="accordion-trigger" type="button" aria-expanded="false">Composition<i></i></button>' +
        '<div class="accordion-panel"><div>' + p.composition + '</div></div>' +
      '</div>' +
      '<div class="accordion-item">' +
        '<button class="accordion-trigger" type="button" aria-expanded="false">Entretien<i></i></button>' +
        '<div class="accordion-panel"><div>' + p.care + '</div></div>' +
      '</div>' +
      '<div class="accordion-item">' +
        '<button class="accordion-trigger" type="button" aria-expanded="false">Livraison et retours<i></i></button>' +
        '<div class="accordion-panel"><div>Expédition sous 24 h ouvrées. Livraison en 24-48 h en France métropolitaine, offerte dès 80 € d\'achat. Retours gratuits sous 30 jours, article non porté et étiquette d\'origine attachée.</div></div>' +
      '</div>' +
    '</div>' +
    (singleSize ? '' : '') +
  '</div>';
}

function updateSeo(p) {
  document.title = p.name + ' — NOVRA';
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', p.description.slice(0, 155));
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute('href', 'https://novra-frontend.vercel.app/product.html?id=' + p.id);

  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.images.slice(0, 4),
    description: p.description,
    brand: { '@type': 'Brand', name: 'NOVRA' },
    category: p.categoryLabel,
    aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
    offers: {
      '@type': 'Offer',
      price: p.price.toFixed(2),
      priceCurrency: 'EUR',
      availability: p.stock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
    }
  });
  document.head.appendChild(ld);
}

function renderNotFound(root) {
  root.innerHTML = '<div class="empty-state" style="grid-column:1/-1">' +
    '<h2 class="display-3">Produit introuvable</h2>' +
    '<p>Ce produit n\'existe pas ou n\'est plus disponible.</p>' +
    '<a class="btn" href="marketplace.html">Retour à la boutique</a></div>';
}

/* Le prix affiché doit être celui qui sera facturé : on redessine la fiche
   dès que la base a répondu. */
if (typeof onCatalogueUpdate === 'function') onCatalogueUpdate(function () {
  const root = document.getElementById('pdp-root');
  if (!root || !pdp.product) return;
  const fresh = getProductById(pdp.product.id);
  if (!fresh) return;
  pdp.product = fresh;
  root.innerHTML = pdpMarkup(fresh);
  initAccordions();
});

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('pdp-root');
  const params = new URLSearchParams(window.location.search);
  const product = getProductById(params.get('id'));

  if (!product) { renderNotFound(root); return; }

  pdp.product = product;
  pdp.color = product.colors[0];
  pdp.size = product.sizes.length === 1 ? product.sizes[0] : null;

  document.getElementById('pdp-breadcrumb').innerHTML =
    '<a href="index.html">Accueil</a><span>/</span><a href="marketplace.html?category=' + product.category + '">' +
    product.categoryLabel + '</a><span>/</span>' + product.name;

  root.innerHTML = pdpMarkup(product);
  updateSeo(product);
  initAccordions();

  if (pdp.size) {
    const only = root.querySelector('[data-size="' + pdp.size + '"]');
    if (only) only.classList.add('is-active');
  }

  /* Galerie */
  const mainImg = document.getElementById('pdp-main-image');
  root.addEventListener('click', function (e) {
    const thumb = e.target.closest('[data-thumb]');
    if (thumb) {
      const i = parseInt(thumb.dataset.thumb, 10);
      mainImg.src = product.images[i];
      root.querySelectorAll('[data-thumb]').forEach(function (b) { b.classList.remove('is-active'); });
      thumb.classList.add('is-active');
      return;
    }

    const color = e.target.closest('#pdp-colors [data-color]');
    if (color) {
      pdp.color = color.dataset.color;
      document.getElementById('pdp-color-label').textContent = pdp.color;
      root.querySelectorAll('#pdp-colors [data-color]').forEach(function (b) { b.classList.remove('is-active'); });
      color.classList.add('is-active');
      return;
    }

    const size = e.target.closest('#pdp-sizes [data-size]');
    if (size) {
      pdp.size = size.dataset.size;
      root.querySelectorAll('#pdp-sizes [data-size]').forEach(function (b) { b.classList.remove('is-active'); });
      size.classList.add('is-active');
      document.getElementById('pdp-size-error').textContent = '';
      return;
    }

    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      pdp.qty = Math.max(1, Math.min(20, pdp.qty + parseInt(qtyBtn.dataset.qty, 10)));
      document.getElementById('pdp-qty').textContent = pdp.qty;
      return;
    }

    if (e.target.closest('[data-open-size-guide]')) {
      document.getElementById('size-guide').classList.add('is-open');
      Overlay.lock();
      return;
    }

    if (e.target.closest('#pdp-add')) {
      if (!pdp.size) {
        document.getElementById('pdp-size-error').textContent = 'Merci de sélectionner une taille.';
        notify('Sélectionnez une taille avant d\'ajouter au panier', null, true);
        return;
      }
      Cart.add(product.id, pdp.size, pdp.color, pdp.qty);
      notify(product.name + ' ajouté au panier', product.images[0]);
      openCart();
    }
  });

  /* Modale guide des tailles */
  const modal = document.getElementById('size-guide');
  modal.addEventListener('click', function (e) {
    if (e.target === modal || e.target.closest('[data-close-modal]')) {
      modal.classList.remove('is-open');
      Overlay.unlock();
    }
  });

  /* Recommandations */
  const related = getRelatedProducts(product, 4);
  if (related.length) {
    document.getElementById('related-section').hidden = false;
    document.getElementById('related-grid').innerHTML = related.map(function (p, i) {
      return productCardMarkup(p, { index: i });
    }).join('');
    initReveal();
  }
});
