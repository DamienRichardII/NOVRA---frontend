/* =========================================================================
   NOVRA — Suivi de commande sans compte

   Le client retrouve sa commande avec son numéro et son adresse e-mail.
   Les deux sont exigés : le numéro seul ne doit pas suffire, sinon
   n'importe qui pourrait lire la commande d'un autre en devinant une
   référence. Le serveur renvoie le même message d'échec dans tous les cas,
   pour ne pas révéler qu'une référence existe.
   ========================================================================= */

function trackSetError(input, message) {
  const field = input.closest('.field');
  if (!field) return !message;
  field.classList.toggle('has-error', Boolean(message));
  const holder = field.querySelector('.field-error');
  if (holder) holder.textContent = message || '';
  return !message;
}

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('track-form');
  if (!form) return;

  const wrap = document.getElementById('track-form-wrap');
  const result = document.getElementById('track-result');
  const feedback = document.getElementById('track-feedback');
  const submit = document.getElementById('track-submit');
  const refInput = document.getElementById('t-reference');
  const mailInput = document.getElementById('t-email');

  /* Arrivée depuis la page de confirmation : la référence est pré-remplie,
     l'adresse reste à saisir. */
  const fromUrl = new URLSearchParams(location.search).get('reference');
  if (fromUrl) {
    refInput.value = fromUrl.toUpperCase();
    mailInput.focus();
  }

  /* Mise en forme discrète pendant la saisie, sans bloquer le collage. */
  refInput.addEventListener('input', function () {
    refInput.value = refInput.value.toUpperCase().replace(/\s+/g, '');
  });

  function show(order) {
    wrap.hidden = true;
    result.innerHTML = ovRender(order, {
      title: 'Votre commande',
      intro: 'Voici l\'état actuel de votre commande. Cette page se met à jour à chaque étape.',
      trackLink: false
    }) +
    '<p style="text-align:center;margin-top:26px">' +
      '<button class="link-underline" type="button" id="track-other" style="background:none;border:0;cursor:pointer;font:inherit">' +
      'Rechercher une autre commande</button></p>';

    const other = document.getElementById('track-other');
    if (other) other.addEventListener('click', function () {
      result.innerHTML = '';
      wrap.hidden = false;
      feedback.textContent = '';
      history.replaceState(null, '', location.pathname);
      refInput.focus();
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const reference = refInput.value.trim().toUpperCase();
    const email = mailInput.value.trim().toLowerCase();

    let valid = true;
    valid = trackSetError(refInput, reference ? '' : 'Indiquez votre numéro de commande.') && valid;
    valid = trackSetError(mailInput, /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email) ? '' : 'Adresse e-mail invalide.') && valid;
    if (!valid) return;

    submit.disabled = true;
    submit.textContent = 'Recherche…';
    feedback.textContent = '';
    feedback.className = 'form-feedback';

    novraFunction('order-status', { query: { reference: reference, email: email } })
      .then(function (order) { show(order); })
      .catch(function (err) {
        feedback.textContent = err.message ||
          'Aucune commande ne correspond à ces informations. Vérifiez le numéro et l\'adresse utilisée lors de l\'achat.';
        feedback.className = 'form-feedback is-error';
      })
      .finally(function () {
        submit.disabled = false;
        submit.textContent = 'Voir ma commande';
      });
  });
});
