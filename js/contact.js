/* =========================================================================
   NOVRA — Formulaire de contact (validation front-end)
   Aucune donnée n'est transmise tant qu'aucun backend n'est connecté.
   ========================================================================= */

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const feedback = document.getElementById('contact-feedback');

  function setError(input, message) {
    const field = input.closest('.field');
    if (!field) return !message;
    const holder = field.querySelector('.field-error');
    field.classList.toggle('has-error', Boolean(message));
    if (holder) holder.textContent = message || '';
    return !message;
  }

  function validate(input) {
    const value = (input.value || '').trim();
    if (input.hasAttribute('required') && !value) return setError(input, 'Ce champ est obligatoire.');
    if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) {
      return setError(input, 'Adresse e-mail invalide.');
    }
    if (input.type === 'tel' && value && !/^[0-9+\s().-]{8,}$/.test(value)) {
      return setError(input, 'Numéro de téléphone invalide.');
    }
    if (input.id === 'c-message' && value && value.length < 12) {
      return setError(input, 'Merci de détailler un peu votre message.');
    }
    return setError(input, '');
  }

  form.querySelectorAll('input, select, textarea').forEach(function (el) {
    if (el.type === 'checkbox') return;
    el.addEventListener('blur', function () { validate(el); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    let valid = true;
    let first = null;

    form.querySelectorAll('input[required], select[required], textarea[required]').forEach(function (el) {
      if (el.type === 'checkbox') return;
      if (!validate(el)) { valid = false; if (!first) first = el; }
    });

    const consent = document.getElementById('c-consent');
    const consentError = document.getElementById('consent-error');
    if (!consent.checked) {
      consentError.textContent = 'Merci de donner votre consentement pour traiter la demande.';
      valid = false;
      if (!first) first = consent;
    } else {
      consentError.textContent = '';
    }

    if (!valid) {
      feedback.textContent = '';
      feedback.className = 'form-feedback';
      if (first) first.focus();
      notify('Merci de compléter les champs manquants.', null, true);
      return;
    }

    form.reset();
    feedback.textContent = 'Message envoyé. L\'équipe NOVRA vous répond sous 24 à 48 h ouvrées.';
    feedback.className = 'form-feedback is-ok';
    notify('Votre message a bien été enregistré');
  });
});
