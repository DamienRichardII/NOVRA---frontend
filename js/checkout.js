/* =========================================================================
   NOVRA — Checkout (simulation front-end)
   Point d'intégration d'un prestataire de paiement : processPayment().
   ========================================================================= */

const SHIPPING_METHODS = {
  standard: { label: 'Livraison standard', price: null },   // null = règle panier (offerte dès 80 €)
  express:  { label: 'Livraison express', price: 9.9 },
  pickup:   { label: 'Point relais', price: 2.9 }
};

let shippingMethod = 'standard';

function shippingPrice() {
  const method = SHIPPING_METHODS[shippingMethod];
  return method.price === null ? Cart.shipping() : method.price;
}

function renderCheckoutSummary() {
  const linesRoot = document.getElementById('checkout-lines');
  const totalsRoot = document.getElementById('checkout-totals');
  if (!linesRoot) return;

  const lines = Cart.lines();

  if (!lines.length) {
    linesRoot.innerHTML = '<p style="color:var(--grey-500);font-size:.9rem">Votre panier est vide.</p>';
    totalsRoot.innerHTML = '';
    return;
  }

  linesRoot.innerHTML = lines.map(function (l) {
    const meta = (l.color || '') + (l.size && l.size !== 'TU' ? ' / ' + l.size : '') + ' × ' + l.qty;
    return '<div class="summary-line">' +
      '<img src="' + l.product.images[0] + '" alt="" width="56" height="75" loading="lazy">' +
      '<div><h4>' + l.product.name + '</h4><span>' + meta + '</span></div>' +
      '<strong>' + formatPrice(l.total) + '</strong>' +
    '</div>';
  }).join('');

  const sub = Cart.subtotal();
  const ship = shippingPrice();
  totalsRoot.innerHTML =
    '<div class="total-row"><span>Sous-total</span><span>' + formatPrice(sub) + '</span></div>' +
    '<div class="total-row"><span>Livraison</span><span>' + (ship === 0 ? 'Offerte' : formatPrice(ship)) + '</span></div>' +
    '<div class="total-row is-total"><span>Total</span><span>' + formatPrice(sub + ship) + '</span></div>';

  const std = document.querySelector('[data-shipping-standard]');
  if (std) std.textContent = Cart.shipping() === 0 ? 'Offerte' : formatPrice(Cart.shipping());
}

/* ------------------------------ Validation -------------------------------- */
function setFieldError(input, message) {
  const field = input.closest('.field') || input.parentElement;
  const holder = field.querySelector('.field-error');
  field.classList.toggle('has-error', Boolean(message));
  if (holder) holder.textContent = message || '';
  return !message;
}

function validateField(input) {
  const value = (input.value || '').trim();

  if (input.hasAttribute('required') && !value) {
    return setFieldError(input, 'Ce champ est obligatoire.');
  }
  if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) {
    return setFieldError(input, 'Adresse e-mail invalide.');
  }
  if (input.type === 'tel' && value && !/^[0-9+\s().-]{8,}$/.test(value)) {
    return setFieldError(input, 'Numéro de téléphone invalide.');
  }
  if (input.id === 'zip' && value && !/^[0-9A-Za-z\s-]{4,10}$/.test(value)) {
    return setFieldError(input, 'Code postal invalide.');
  }
  return setFieldError(input, '');
}

function validateForm(form) {
  let valid = true;
  let firstInvalid = null;

  form.querySelectorAll('input[required], select[required]').forEach(function (input) {
    if (input.type === 'checkbox') return;
    if (!validateField(input)) {
      valid = false;
      if (!firstInvalid) firstInvalid = input;
    }
  });

  const terms = document.getElementById('terms');
  const termsError = document.getElementById('terms-error');
  if (!terms.checked) {
    termsError.textContent = 'Vous devez accepter les conditions générales de vente.';
    valid = false;
    if (!firstInvalid) firstInvalid = terms;
  } else {
    termsError.textContent = '';
  }

  if (firstInvalid) firstInvalid.focus();
  return valid;
}

/* ------------------------- Intégration paiement --------------------------- */
/**
 * Point d'entrée unique pour brancher un prestataire (Stripe, SumUp…).
 * Remplacer le contenu par l'appel réel puis résoudre la promesse.
 */
function processPayment(order) {
  return Promise.resolve({ status: 'simulated', order: order });
}

function generateOrderRef() {
  const d = new Date();
  const stamp = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return 'NVR-' + stamp + '-' + rand;
}

function showConfirmation(order) {
  document.getElementById('checkout-view').hidden = true;
  const view = document.getElementById('confirmation-view');
  view.hidden = false;

  document.getElementById('order-ref').textContent = order.reference;
  document.getElementById('order-email').textContent = order.customer.email;

  document.getElementById('order-summary').innerHTML = order.lines.map(function (l) {
    return '<div class="summary-line">' +
      '<img src="' + l.image + '" alt="" width="56" height="75">' +
      '<div><h4>' + l.name + '</h4><span>' + l.meta + '</span></div>' +
      '<strong>' + formatPrice(l.total) + '</strong>' +
    '</div>';
  }).join('') +
  '<div class="total-row is-total" style="margin-top:16px"><span>Total</span><span>' + formatPrice(order.total) + '</span></div>';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* --------------------------------- Init ----------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  renderCheckoutSummary();

  /* Mode de livraison */
  form.querySelectorAll('input[name="shipping"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      shippingMethod = radio.value;
      form.querySelectorAll('input[name="shipping"]').forEach(function (r) {
        r.closest('.radio-card').classList.toggle('is-selected', r.checked);
      });
      renderCheckoutSummary();
    });
  });

  form.querySelectorAll('input[name="payment"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      form.querySelectorAll('input[name="payment"]').forEach(function (r) {
        r.closest('.radio-card').classList.toggle('is-selected', r.checked);
      });
    });
  });

  /* Validation à la sortie de champ */
  form.querySelectorAll('input[required]').forEach(function (input) {
    if (input.type === 'checkbox') return;
    input.addEventListener('blur', function () { validateField(input); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const lines = Cart.lines();
    if (!lines.length) {
      notify('Votre panier est vide.', null, true);
      return;
    }
    if (!validateForm(form)) {
      notify('Merci de compléter les champs manquants.', null, true);
      return;
    }

    const data = new FormData(form);
    const ship = shippingPrice();

    const order = {
      reference: generateOrderRef(),
      createdAt: new Date().toISOString(),
      customer: {
        firstname: data.get('firstname'),
        lastname: data.get('lastname'),
        email: data.get('email'),
        phone: data.get('phone')
      },
      shippingAddress: {
        address: data.get('address'),
        address2: data.get('address2'),
        zip: data.get('zip'),
        city: data.get('city'),
        country: data.get('country')
      },
      shippingMethod: SHIPPING_METHODS[shippingMethod].label,
      paymentMethod: data.get('payment'),
      lines: lines.map(function (l) {
        return {
          id: l.product.id,
          name: l.product.name,
          image: l.product.images[0],
          meta: (l.color || '') + (l.size && l.size !== 'TU' ? ' / ' + l.size : '') + ' × ' + l.qty,
          qty: l.qty,
          total: l.total
        };
      }),
      subtotal: Cart.subtotal(),
      shipping: ship,
      total: Cart.subtotal() + ship
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Traitement en cours…';

    processPayment(order).then(function () {
      Cart.clear();
      showConfirmation(order);
    }).catch(function () {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Valider la commande';
      notify('Le traitement de la commande a échoué. Merci de réessayer.', null, true);
    });
  });
});
