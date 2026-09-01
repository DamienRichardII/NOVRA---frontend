/* =========================================================================
   NOVRA — Page de confirmation

   Le retour de Stripe ne prouve rien à lui seul : c'est le webhook, côté
   serveur, qui marque la commande payée. Cette page interroge donc la base
   et affiche l'état réel. Si le webhook n'est pas encore passé — quelques
   secondes tout au plus — elle réessaie au lieu d'annoncer un échec.
   ========================================================================= */

const CHECK_DELAYS = [1500, 2500, 4000, 6000];   // relances, puis on s'arrête

function confMoney(n) {
  return (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function confEsc(v) {
  return String(v === null || v === undefined ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderPaid(order) {
  const lines = (order.items || []).map(function (i) {
    const meta = [i.color, i.size && i.size !== 'TU' ? 'Taille ' + i.size : null].filter(Boolean).join(' / ');
    return '<div class="summary-line">' +
      '<div><h4>' + confEsc(i.product_name) + '</h4><span>' + confEsc(meta) + ' × ' + i.qty + '</span></div>' +
      '<strong>' + confMoney(i.line_total) + '</strong></div>';
  }).join('');

  return '<div class="confirmation-mark"><svg viewBox="0 0 24 24"><path d="M5 13l4.5 4.5L19 7"/></svg></div>' +
    '<h1 class="display-3">Commande confirmée</h1>' +
    '<p class="order-ref">' + confEsc(order.reference) + '</p>' +
    '<p class="lead" style="margin:0 auto 10px">Merci pour votre confiance. Un e-mail de confirmation a été envoyé par Stripe à ' +
      '<strong>' + confEsc(order.email) + '</strong>.</p>' +
    '<p style="color:var(--grey-500);font-size:.88rem">Conservez cette référence : elle vous sera demandée pour toute question sur votre commande.</p>' +
    '<div style="margin:34px 0;text-align:left">' + lines +
      '<div class="total-row"><span>Sous-total</span><span>' + confMoney(order.subtotal) + '</span></div>' +
      (Number(order.discount) > 0 ? '<div class="total-row"><span>Remise</span><span>− ' + confMoney(order.discount) + '</span></div>' : '') +
      '<div class="total-row"><span>' + confEsc(order.shipping_method || 'Livraison') + '</span><span>' +
        (Number(order.shipping) === 0 ? 'Offerte' : confMoney(order.shipping)) + '</span></div>' +
      '<div class="total-row is-total"><span>Total payé</span><span>' + confMoney(order.total) + '</span></div>' +
    '</div>' +
    '<a class="btn" href="marketplace.html">Retour à la boutique</a>';
}

function renderPending(order) {
  return '<h1 class="display-3">Paiement en cours de validation</h1>' +
    '<p class="order-ref">' + confEsc(order.reference) + '</p>' +
    '<p class="lead" style="margin:0 auto 10px">Votre paiement a bien été transmis. La confirmation définitive arrive dans quelques instants ' +
      'et vous la recevrez par e-mail.</p>' +
    '<p style="color:var(--grey-500);font-size:.88rem">Inutile de recommencer votre commande : vous ne serez pas débité deux fois. ' +
      'Notez la référence ci-dessus.</p>' +
    '<a class="btn" href="marketplace.html">Retour à la boutique</a>';
}

function renderProblem(title, message) {
  return '<h1 class="display-3">' + confEsc(title) + '</h1>' +
    '<p class="lead" style="margin:0 auto 20px">' + confEsc(message) + '</p>' +
    '<a class="btn" href="cart.html">Revenir au panier</a>';
}

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('confirmation-root');
  if (!root) return;

  const session = new URLSearchParams(location.search).get('session');
  if (!session) {
    root.innerHTML = renderProblem('Aucune commande à afficher',
      "Cette page s'affiche après un paiement. Vous y accédez sans référence de commande.");
    return;
  }

  let attempt = 0;

  function look() {
    novraFunction('order-status', { query: { session: session } })
      .then(function (order) {
        if (order.paid) {
          /* Le panier n'est vidé qu'ici : la commande est bel et bien payée. */
          if (typeof Cart !== 'undefined') Cart.clear();
          root.innerHTML = renderPaid(order);
          return;
        }
        if (order.status === 'cancelled') {
          root.innerHTML = renderProblem('Paiement non abouti',
            "Cette commande a été annulée. Votre panier a été conservé, vous pouvez recommencer.");
          return;
        }
        /* Encore en attente : on laisse au webhook le temps d'arriver. */
        if (attempt < CHECK_DELAYS.length) {
          setTimeout(look, CHECK_DELAYS[attempt++]);
          return;
        }
        if (typeof Cart !== 'undefined') Cart.clear();
        root.innerHTML = renderPending(order);
      })
      .catch(function (e) {
        if (attempt < CHECK_DELAYS.length) {
          setTimeout(look, CHECK_DELAYS[attempt++]);
          return;
        }
        root.innerHTML = renderProblem('Commande introuvable',
          e.message || "Nous n'avons pas retrouvé cette commande. Contactez-nous en indiquant la date et l'heure de votre paiement.");
      });
  }

  look();
});
