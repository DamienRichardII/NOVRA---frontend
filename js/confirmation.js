/* =========================================================================
   NOVRA — Page de confirmation

   Le retour de Stripe ne prouve rien à lui seul : c'est le webhook, côté
   serveur, qui marque la commande payée. Cette page interroge donc la base
   et affiche l'état réel. Si le webhook n'est pas encore passé — quelques
   secondes tout au plus — elle réessaie au lieu d'annoncer un échec.

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

  const session = new URLSearchParams(location.search).get('session');
  if (!session) {
    root.innerHTML = confProblem('Aucune commande à afficher',
      "Cette page s'affiche après un paiement. Si vous cherchez une commande passée, utilisez le suivi.",
      '<a class="btn" href="suivi.html">Suivre une commande</a>');
    return;
  }

  let attempt = 0;

  function look() {
    novraFunction('order-status', { query: { session: session } })
      .then(function (order) {
        if (order.cancelled) {
          root.innerHTML = confProblem('Paiement non abouti',
            "Cette commande a été annulée et rien n'a été débité. Votre panier a été conservé.");
          return;
        }

        if (order.paid) {
          /* Le panier n'est vidé qu'ici, une fois le paiement réellement
             confirmé, et le jeton de caisse libéré pour un prochain achat. */
          if (typeof Cart !== 'undefined') Cart.clear();
          try { sessionStorage.removeItem('novra_checkout_token'); } catch (e) { /* navigation privée */ }

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
