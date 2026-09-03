/* =========================================================================
   NOVRA — Page de confirmation

   Le retour du navigateur ne prouve rien : c'est le serveur qui, après avoir
   interrogé SumUp, marque la commande payée. Cette page lit donc l'état réel
   en base. Si la vérification n'est pas encore passée — quelques secondes
   tout au plus — elle réessaie au lieu d'annoncer un échec.

   Le client peut fermer son navigateur : le jeton est conservé localement et
   la commande reste consultable via la page de suivi.

   Rechargée plusieurs fois, elle affiche exactement la même chose : rien
   n'est créé ni modifié ici.
   ========================================================================= */

const CONF_DELAYS = [1500, 2500, 4000, 6000];

function confProblem(title, message, cta) {
  return '<div class="order-track" style="text-align:center">' +
    '<h1 class="display-3">' + ovEsc(title) + '</h1>' +
    '<p class="lead" style="margin:14px auto 26px">' + ovEsc(message) + '</p>' +
    (cta || '<a class="btn" href="cart.html">Revenir au panier</a>') +
  '</div>';
}

document.addEventListener('DOMContentLoaded', function () {
  const root = document.getElementById('confirmation-root');
  if (!root) return;

  const params = new URLSearchParams(location.search);
  let reference = (params.get('ref') || '').toUpperCase();
  let token = params.get('t') || '';

  /* SumUp peut renvoyer le client sans nos paramètres : on retombe alors sur
     ce qui a été mémorisé au départ du paiement. */
  if (!reference || !token) {
    try {
      const saved = JSON.parse(localStorage.getItem('novra_last_order') || 'null');
      if (saved && saved.reference && saved.token) { reference = saved.reference; token = saved.token; }
    } catch (e) { /* stockage indisponible */ }
  }

  if (!reference || !token) {
    root.innerHTML = confProblem('Aucune commande à afficher',
      "Cette page s'affiche après un paiement. Si vous cherchez une commande passée, utilisez le suivi.",
      '<a class="btn" href="suivi.html">Suivre une commande</a>');
    return;
  }

  let attempt = 0;

  function look() {
    novraFunction('order-status', { query: { ref: reference, t: token } })
      .then(function (order) {
        if (order.failed || order.expired || order.cancelled) {
          root.innerHTML = confProblem(
            order.expired ? 'Paiement expiré' : 'Paiement non abouti',
            order.expired
              ? "La page de paiement a expiré avant validation. Rien n'a été débité et votre panier a été conservé."
              : "Le paiement n'a pas abouti. Rien n'a été débité et votre panier a été conservé, vous pouvez réessayer.",
            '<a class="btn" href="checkout.html">Reprendre ma commande</a>');
          return;
        }

        if (order.paid) {
          /* Le panier n'est vidé qu'ici, une fois le paiement réellement
             confirmé, et le jeton de caisse libéré pour un prochain achat. */
          if (typeof Cart !== 'undefined') Cart.clear();
          try {
            sessionStorage.removeItem('novra_checkout_token');
            localStorage.removeItem('novra_last_order');
          } catch (e) { /* navigation privée */ }

          root.innerHTML = ovRender(order, {
            title: 'Commande confirmée',
            intro: 'Merci pour votre confiance. Un récapitulatif a été envoyé à <strong>' +
              ovEsc(order.email) + '</strong>.'
          });
          return;
        }

        /* Encore en attente : on laisse au webhook le temps d'arriver. */
        if (attempt < CONF_DELAYS.length) { setTimeout(look, CONF_DELAYS[attempt++]); return; }

        if (typeof Cart !== 'undefined') Cart.clear();
        root.innerHTML = ovRender(order, {
          title: 'Paiement en cours de validation',
          intro: 'Votre paiement a bien été transmis. La confirmation définitive arrive dans quelques instants. ' +
            'Inutile de recommencer : vous ne serez pas débité deux fois.'
        });
      })
      .catch(function (e) {
        if (attempt < CONF_DELAYS.length) { setTimeout(look, CONF_DELAYS[attempt++]); return; }
        root.innerHTML = confProblem('Commande introuvable',
          e.message || "Nous n'avons pas retrouvé cette commande. Contactez-nous en indiquant la date et l'heure de votre paiement.",
          '<a class="btn" href="contact.html">Nous contacter</a>');
      });
  }

  look();
});
