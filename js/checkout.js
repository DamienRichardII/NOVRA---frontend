/* =========================================================================
   NOVRA — Tunnel de commande

   Ces montants ne servent qu'à l'affichage. Le prix réellement encaissé est
   recalculé par la fonction create-order à partir de la base :
   modifier ces valeurs dans la console ne change rien au débit.
   ========================================================================= */

const SHIPPING_METHODS = {
  standard: { label: 'Livraison standard', price: null, fulfilment: 'delivery' },   // null = offerte dès 80 €
  express:  { label: 'Livraison express',  price: 9.9,  fulfilment: 'delivery' },
  relay:    { label: 'Point relais',       price: 2.9,  fulfilment: 'relay' },
  pickup:   { label: 'Retrait en boutique', price: 0,   fulfilment: 'pickup' }
};

let shippingMethod = 'standard';
let storeInfo = null;

function isPickup() {
  return SHIPPING_METHODS[shippingMethod].fulfilment === 'pickup';
}

function shippingPrice() {
  const method = SHIPPING_METHODS[shippingMethod];
  return method.price === null ? Cart.shipping() : method.price;
}

/* Le retrait n'apparaît que si la boutique est réellement renseignée en base.
   Tant qu'elle ne l'est pas, l'option reste cachée plutôt que d'annoncer un
   retrait impossible. */
function loadStore() {
  return novraRest('store_settings?id=eq.true&select=name,address,zip,city,phone,hours,pickup_note')
    .then(function (rows) {
      const s = (rows && rows[0]) || null;
      if (!s || !s.address || !s.city) return null;
      storeInfo = s;

      const card = document.getElementById('pickup-card');
      const line = document.getElementById('pickup-line');
      if (card) card.hidden = false;
      if (line) line.textContent = [s.address, s.zip, s.city].filter(Boolean).join(', ');
      return s;
    })
    .catch(function () { return null; });
}

function renderPickupInfo() {
  const box = document.getElementById('pickup-info');
  if (!box) return;
  if (!isPickup() || !storeInfo) { box.hidden = true; box.innerHTML = ''; return; }

  const hours = Array.isArray(storeInfo.hours) ? storeInfo.hours : [];
  box.hidden = false;
  box.innerHTML =
    '<h3>' + (storeInfo.name || 'Boutique NOVRA') + '</h3>' +
    '<p>' + [storeInfo.address, storeInfo.zip, storeInfo.city].filter(Boolean).join(', ') + '</p>' +
    (storeInfo.phone ? '<p>' + storeInfo.phone + '</p>' : '') +
    (hours.length ? '<ul>' + hours.map(function (h) {
      return '<li><span>' + (h.day || '') + '</span><span>' + (h.hours || '') + '</span></li>';
    }).join('') + '</ul>' : '') +
    '<p class="pickup-note">' + (storeInfo.pickup_note ||
      'Vous serez prévenu par e-mail dès que votre commande sera prête. Munissez-vous de votre numéro de commande.') + '</p>';
}

/* Champs indispensables à une livraison. La liste est écrite noir sur blanc
   plutôt que déduite de l'état courant : la fonction peut ainsi être
   appelée autant de fois qu'on veut sans jamais perdre l'information. */
const DELIVERY_REQUIRED = ['address', 'zip', 'city'];

/* En retrait, l'adresse postale n'a pas lieu d'être : on la masque et on
   lève l'obligation de la remplir, sinon le formulaire refuse de partir. */
function syncAddressStep() {
  const step = document.getElementById('address-step');
  if (!step) return;
  const pickup = isPickup();
  step.hidden = pickup;

  DELIVERY_REQUIRED.forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.required = !pickup;
    if (!pickup) return;
    const field = el.closest('.field');
    if (!field) return;
    field.classList.remove('has-error');
    const holder = field.querySelector('.field-error');
    if (holder) holder.textContent = '';
  });
}

function renderCheckoutSummary() {
  const linesRoot = document.getElementById('checkout-lines');
  const totalsRoot = document.getElementById('checkout-totals');
  if (!linesRoot) return;

  const lines = Cart.lines();

  /* Panier vide : on le dit clairement et on empêche de valider dans le vide. */
  if (!lines.length) {
    linesRoot.innerHTML = '<p style="color:var(--grey-500);font-size:.9rem">Votre panier est vide.</p>' +
      '<a class="link-underline" href="marketplace.html">Voir la boutique</a>';
    totalsRoot.innerHTML = '';
    const submit = document.querySelector('#checkout-form button[type="submit"]');
    if (submit) { submit.disabled = true; submit.textContent = 'Panier vide'; }
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
  const disc = Cart.discount();
  const ship = isPickup() ? 0 : shippingPrice();
  const code = Cart.promoCode();

  totalsRoot.innerHTML =
    '<div class="total-row"><span>Sous-total</span><span>' + formatPrice(sub) + '</span></div>' +
    (disc > 0 ? '<div class="total-row"><span>Remise' + (code ? ' (' + code + ')' : '') + '</span><span>− ' + formatPrice(disc) + '</span></div>' : '') +
    '<div class="total-row"><span>' + (isPickup() ? 'Retrait en boutique' : 'Livraison') + '</span><span>' +
      (ship === 0 ? (isPickup() ? 'Gratuit' : 'Offerte') : formatPrice(ship)) + '</span></div>' +
    '<div class="total-row is-total"><span>Total</span><span>' + formatPrice(Math.max(0, sub - disc) + ship) + '</span></div>';

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
 * Crée la commande en base et ouvre le paiement SumUp.
 *
 * Le navigateur n'envoie que des références et des quantités : les prix, les
 * stocks et les remises sont recalculés côté serveur à partir de la base.
 * Un client qui modifierait le panier dans la console paierait quand même
 * le bon montant.
 */
/* Jeton stable pour un passage en caisse : un double clic, un rechargement
   ou une reprise réseau retombent sur la même commande côté serveur. */
function checkoutToken() {
  try {
    let t = sessionStorage.getItem('novra_checkout_token');
    if (!t) {
      t = 'chk_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem('novra_checkout_token', t);
    }
    return t;
  } catch (e) { return ''; }
}

function clearCheckoutToken() {
  try { sessionStorage.removeItem('novra_checkout_token'); } catch (e) { /* navigation privée */ }
}

function processPayment(cartLines, customer, address, method, promo, token) {
  return novraFunction('create-checkout-session', {
    method: 'POST',
    body: {
      idempotency_key: token || '',
      lines: cartLines.map(function (l) {
        return { slug: l.product.id, color: l.color || null, size: l.size || null, qty: l.qty };
      }),
      email: customer.email,
      shipping: method,
      promo: promo || '',
      address: {
        firstname: customer.firstname, lastname: customer.lastname, phone: customer.phone,
        address: address.address, address2: address.address2,
        zip: address.zip, city: address.city, country: address.country
      }
    }
  });
}

/* La confirmation vit sur confirmation.html : elle est affichée au retour de
   SumUp, à partir de la commande réellement enregistrée en base. */

/* --------------------------------- Init ----------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  renderCheckoutSummary();
  syncAddressStep();
  loadStore();

  /* Mode de réception */
  form.addEventListener('change', function (e) {
    const radio = e.target.closest('input[name="shipping"]');
    if (!radio) return;
    shippingMethod = radio.value;
    form.querySelectorAll('input[name="shipping"]').forEach(function (r) {
      r.closest('.radio-card').classList.toggle('is-selected', r.checked);
    });
    syncAddressStep();
    renderPickupInfo();
    renderCheckoutSummary();
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

    const customer = {
      firstname: data.get('firstname'),
      lastname: data.get('lastname'),
      email: data.get('email'),
      phone: data.get('phone')
    };
    const address = {
      address: data.get('address'),
      address2: data.get('address2'),
      zip: data.get('zip'),
      city: data.get('city'),
      country: data.get('country')
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn.disabled) return;   /* double clic : la première demande suffit */
    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirection vers le paiement…';

    processPayment(lines, customer, address, shippingMethod, Cart.promoCode(), checkoutToken())
      .then(function (order) {
        if (!order || !order.checkout_url) throw new Error('Paiement indisponible.');
        /* Le jeton de consultation permet de retrouver la commande au retour,
           même si le navigateur a été fermé entre-temps. */
        try {
          localStorage.setItem('novra_last_order', JSON.stringify({
            reference: order.reference, token: order.access_token
          }));
        } catch (e) { /* navigation privée */ }
        /* Le panier n'est vidé qu'au retour d'un paiement confirmé :
           un client qui abandonne retrouve ses articles intacts. */
        window.location.href = order.checkout_url;
      })
      .catch(function (e) {
        clearCheckoutToken();   /* la tentative a échoué : on repart sur une neuve */
        submitBtn.disabled = false;
        submitBtn.textContent = 'Valider la commande';
        notify(e.message || 'Le paiement n\'a pas pu être ouvert. Merci de réessayer.', null, true);
      });
  });

  /* Retour depuis SumUp après un abandon de paiement. */
  if (new URLSearchParams(location.search).get('paiement') === 'annule') {
    notify('Paiement annulé. Votre panier a été conservé.', null, true);
    history.replaceState(null, '', location.pathname);
  }
});
