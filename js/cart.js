/* =========================================================================
   NOVRA — Panier
   Persistance localStorage. Un article = id + taille + couleur.
   ========================================================================= */

const CART_KEY = 'novra_cart_v1';
const PROMO_KEY = 'novra_promo_v1';
const SHIPPING_THRESHOLD = 80;   // livraison offerte au-delà
const SHIPPING_COST = 4.9;

/* Les codes promo vivent en base et sont vérifiés à nouveau au moment du
   paiement. Ce cache ne sert qu'à afficher le montant dans le panier :
   il ne décide de rien. */
let promoCache = null;

const Cart = {

  read() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  },

  write(items) {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (e) {
      /* stockage indisponible (navigation privée) : le panier reste en mémoire */
    }
    document.dispatchEvent(new CustomEvent('cart:change', { detail: items }));
  },

  key(item) { return item.id + '|' + (item.size || '') + '|' + (item.color || ''); },

  add(id, size, color, qty) {
    const items = this.read();
    const line = { id: id, size: size || '', color: color || '', qty: qty || 1 };
    const existing = items.find(function (i) {
      return i.id === line.id && i.size === line.size && i.color === line.color;
    });
    if (existing) existing.qty += line.qty;
    else items.push(line);
    this.write(items);
    return line;
  },

  updateQty(key, qty) {
    const items = this.read();
    const self = this;
    const item = items.find(function (i) { return self.key(i) === key; });
    if (!item) return;
    item.qty = Math.max(1, Math.min(20, qty));
    this.write(items);
  },

  remove(key) {
    const self = this;
    this.write(this.read().filter(function (i) { return self.key(i) !== key; }));
  },

  clear() { this.setPromo('', null); this.write([]); },

  count() {
    return this.read().reduce(function (n, i) { return n + i.qty; }, 0);
  },

  /* Lignes enrichies avec les données catalogue */
  lines() {
    const self = this;
    return this.read().map(function (i) {
      const product = getProductById(i.id);
      if (!product) return null;
      return {
        key: self.key(i),
        product: product,
        size: i.size,
        color: i.color,
        qty: i.qty,
        total: product.price * i.qty
      };
    }).filter(Boolean);
  },

  subtotal() {
    return this.lines().reduce(function (s, l) { return s + l.total; }, 0);
  },

  shipping() {
    const sub = this.subtotal();
    if (sub === 0 || sub >= SHIPPING_THRESHOLD) return 0;
    return SHIPPING_COST;
  },

  /* Code promotionnel retenu entre le panier et le tunnel de commande. */
  promoCode() {
    try { return localStorage.getItem(PROMO_KEY) || ''; } catch (e) { return ''; }
  },

  setPromo(code, promo) {
    promoCache = promo || null;
    try {
      if (code) localStorage.setItem(PROMO_KEY, code);
      else localStorage.removeItem(PROMO_KEY);
    } catch (e) { /* navigation privée */ }
  },

  discount() {
    if (!promoCache) return 0;
    const sub = this.subtotal();
    if (sub < Number(promoCache.min_amount || 0)) return 0;
    if (promoCache.kind === 'percent') return sub * Number(promoCache.value) / 100;
    if (promoCache.kind === 'amount') return Math.min(sub, Number(promoCache.value));
    return 0;   /* livraison offerte : traitée dans shipping() */
  },

  total() {
    const ship = (promoCache && promoCache.kind === 'free_shipping') ? 0 : this.shipping();
    return Math.max(0, this.subtotal() - this.discount() + ship);
  }
};

/* Vérification d'un code auprès de la base. Seuls les codes actifs et dans
   leur période de validité sont lisibles par un visiteur (règle RLS). */
function checkPromoCode(code) {
  return novraRest('promotions?code=eq.' + encodeURIComponent(code) +
    '&select=code,kind,value,min_amount')
    .then(function (rows) { return (rows && rows[0]) || null; })
    .catch(function () { return null; });
}

/* ---------------------------- Rendu du panier ---------------------------- */

function cartLineMarkup(line) {
  const p = line.product;
  return '' +
    '<article class="cart-line" data-key="' + line.key + '">' +
      '<a href="product.html?id=' + p.id + '"><img src="' + p.images[0] + '" alt="' + p.name + '" width="84" height="112" loading="lazy"></a>' +
      '<div>' +
        '<h3><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' +
        '<p class="cart-line-meta">' + (line.color ? line.color : '') +
          (line.size && line.size !== 'TU' ? ' / Taille ' + line.size : (line.size === 'TU' ? ' / Taille unique' : '')) + '</p>' +
        '<div class="cart-line-bottom">' +
          '<div class="qty-mini">' +
            '<button type="button" data-qty="-1" aria-label="Diminuer la quantité">−</button>' +
            '<span>' + line.qty + '</span>' +
            '<button type="button" data-qty="1" aria-label="Augmenter la quantité">+</button>' +
          '</div>' +
          '<span class="line-price">' + formatPrice(line.total) + '</span>' +
        '</div>' +
        '<button type="button" class="line-remove" data-remove>Supprimer</button>' +
      '</div>' +
    '</article>';
}

function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  const foot = document.getElementById('cart-drawer-foot');
  if (!body || !foot) return;

  const lines = Cart.lines();

  if (!lines.length) {
    body.innerHTML = '<div class="cart-empty"><h3 class="display-4">Votre panier est vide</h3>' +
      '<p style="color:var(--grey-500);font-size:.9rem">Explorez la collection NOVRA et composez votre équipement.</p>' +
      '<a class="btn btn-outline" href="marketplace.html">Voir la boutique</a></div>';
    foot.innerHTML = '';
    return;
  }

  body.innerHTML = lines.map(cartLineMarkup).join('');

  const sub = Cart.subtotal();
  const ship = Cart.shipping();
  foot.innerHTML = '' +
    '<div class="totals">' +
      '<div class="total-row"><span>Sous-total</span><span>' + formatPrice(sub) + '</span></div>' +
      '<div class="total-row"><span>Livraison estimée</span><span>' + (ship === 0 ? 'Offerte' : formatPrice(ship)) + '</span></div>' +
      '<div class="total-row is-total"><span>Total</span><span>' + formatPrice(sub + ship) + '</span></div>' +
    '</div>' +
    (sub < SHIPPING_THRESHOLD ? '<p style="font-size:.78rem;color:var(--grey-500);margin:0 0 16px">Plus que ' + formatPrice(SHIPPING_THRESHOLD - sub) + ' pour la livraison offerte.</p>' : '') +
    '<a class="btn btn-block" href="cart.html">Voir le panier</a>' +
    '<a class="btn btn-outline btn-block" style="margin-top:10px" href="checkout.html">Passer la commande</a>';
}

function updateCartCount() {
  const n = Cart.count();
  document.querySelectorAll('[data-cart-count]').forEach(function (el) {
    el.textContent = n;
    el.classList.toggle('is-visible', n > 0);
    if (n > 0) {
      el.classList.remove('is-bump');
      void el.offsetWidth;
      el.classList.add('is-bump');
    }
  });
}

/* Délégation des interactions à l'intérieur d'une liste de lignes panier */
function bindCartLineEvents(root) {
  if (!root || root.dataset.bound) return;
  root.dataset.bound = '1';
  root.addEventListener('click', function (e) {
    const lineEl = e.target.closest('.cart-line');
    if (!lineEl) return;
    const key = lineEl.dataset.key;

    if (e.target.closest('[data-remove]')) {
      Cart.remove(key);
      notify('Article retiré du panier');
      return;
    }
    const qtyBtn = e.target.closest('[data-qty]');
    if (qtyBtn) {
      const current = Cart.read().find(function (i) { return Cart.key(i) === key; });
      if (current) Cart.updateQty(key, current.qty + parseInt(qtyBtn.dataset.qty, 10));
    }
  });
}

/* ------------------------------ Page panier ------------------------------ */
let appliedPromo = '';

function renderCartPage() {
  const linesRoot = document.getElementById('cart-page-lines');
  if (!linesRoot) return;

  const summary = document.getElementById('cart-page-summary');
  const totals = document.getElementById('cart-page-totals');
  const related = document.getElementById('cart-related');
  const lines = Cart.lines();

  if (!lines.length) {
    linesRoot.innerHTML = '<div class="cart-empty">' +
      '<h2 class="display-3" style="margin-bottom:14px">Votre panier est vide</h2>' +
      '<p style="color:var(--grey-500);margin-bottom:28px">Composez votre équipement dans la boutique NOVRA.</p>' +
      '<a class="btn" href="marketplace.html">Découvrir la boutique</a></div>';
    if (summary) summary.hidden = true;
    if (related) related.hidden = true;
    return;
  }

  linesRoot.innerHTML = lines.map(cartLineMarkup).join('');
  if (summary) summary.hidden = false;

  const sub = Cart.subtotal();
  const freePort = promoCache && promoCache.kind === 'free_shipping';
  const ship = freePort ? 0 : Cart.shipping();
  const disc = Cart.discount();

  if (totals) {
    totals.innerHTML =
      '<div class="total-row"><span>Sous-total</span><span>' + formatPrice(sub) + '</span></div>' +
      (disc > 0 ? '<div class="total-row"><span>Remise (' + appliedPromo + ')</span><span>− ' + formatPrice(disc) + '</span></div>' : '') +
      '<div class="total-row"><span>Livraison estimée</span><span>' + (ship === 0 ? 'Offerte' : formatPrice(ship)) + '</span></div>' +
      '<div class="total-row is-total"><span>Total</span><span>' + formatPrice(Cart.total()) + '</span></div>';
  }

  /* Recommandations basées sur le premier article */
  if (related) {
    const suggestions = getRelatedProducts(lines[0].product, 4)
      .filter(function (p) { return !lines.some(function (l) { return l.product.id === p.id; }); })
      .slice(0, 4);
    if (suggestions.length) {
      related.hidden = false;
      document.getElementById('cart-related-grid').innerHTML =
        suggestions.map(function (p, i) { return productCardMarkup(p, { index: i }); }).join('');
      initReveal();
    } else {
      related.hidden = true;
    }
  }
}

function initCartPage() {
  const linesRoot = document.getElementById('cart-page-lines');
  if (!linesRoot) return;

  renderCartPage();
  bindCartLineEvents(linesRoot);

  /* Un code saisi lors d'une visite précédente est revalidé, jamais cru. */
  const stored = Cart.promoCode();
  if (stored) {
    checkPromoCode(stored).then(function (promo) {
      if (!promo || Cart.subtotal() < Number(promo.min_amount || 0)) { Cart.setPromo('', null); appliedPromo = ''; }
      else { Cart.setPromo(promo.code, promo); appliedPromo = promo.code; }
      renderCartPage();
    });
  }

  const apply = document.getElementById('promo-apply');
  if (apply) {
    apply.addEventListener('click', function () {
      const input = document.getElementById('promo-code');
      const feedback = document.getElementById('promo-feedback');
      const code = (input.value || '').toUpperCase().trim();
      if (!code) return;

      apply.disabled = true;
      feedback.textContent = 'Vérification…';
      feedback.className = 'form-feedback';

      checkPromoCode(code).then(function (promo) {
        apply.disabled = false;
        if (!promo) {
          appliedPromo = '';
          Cart.setPromo('', null);
          feedback.textContent = 'Ce code promotionnel n\'est pas valide ou a expiré.';
          feedback.className = 'form-feedback is-error';
        } else if (Cart.subtotal() < Number(promo.min_amount || 0)) {
          appliedPromo = '';
          Cart.setPromo('', null);
          feedback.textContent = 'Ce code s\'applique à partir de ' + formatPrice(promo.min_amount) + ' d\'achat.';
          feedback.className = 'form-feedback is-error';
        } else {
          appliedPromo = promo.code;
          Cart.setPromo(promo.code, promo);
          feedback.textContent = promo.kind === 'percent'
            ? 'Code appliqué : −' + Number(promo.value) + ' %.'
            : promo.kind === 'amount'
              ? 'Code appliqué : −' + formatPrice(promo.value) + '.'
              : 'Code appliqué : livraison offerte.';
          feedback.className = 'form-feedback is-ok';
        }
        renderCartPage();
      });
    });
  }
}

document.addEventListener('cart:change', function () {
  updateCartCount();
  renderCartDrawer();
  renderCartPage();
});

document.addEventListener('DOMContentLoaded', initCartPage);
