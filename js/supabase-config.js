/* =========================================================================
   NOVRA — Connexion Supabase (site public + back-office)
   La clé ci-dessous est la clé PUBLIABLE (anon). Elle est destinée à être
   visible dans le navigateur : toute la protection repose sur les règles
   RLS de la base. Ne jamais placer ici la clé service_role.
   ========================================================================= */

const NOVRA_SUPABASE_URL = 'https://luvydsusnupkxvjfxsug.supabase.co';
const NOVRA_SUPABASE_ANON_KEY = 'sb_publishable_t0hvioNULS1cBjkayowHxw_0lJgf5Ly';
const NOVRA_MEDIA_BUCKET = 'novra-media';

/* Appel d'une fonction serveur (paiement, statut de commande).
   Ces fonctions détiennent les clés secrètes ; le navigateur ne voit rien. */
function novraFunction(name, options) {
  const opts = options || {};
  const query = opts.query ? '?' + new URLSearchParams(opts.query).toString() : '';
  return fetch(NOVRA_SUPABASE_URL + '/functions/v1/' + name + query, {
    method: opts.method || 'GET',
    headers: {
      apikey: NOVRA_SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + NOVRA_SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  }).then(function (r) {
    return r.json().catch(function () { return {}; }).then(function (data) {
      if (!r.ok) throw new Error(data.error || 'Service indisponible.');
      return data;
    });
  });
}

/* Appel REST minimal : évite de charger le SDK sur le site public. */
function novraRest(path, options) {
  const opts = options || {};
  return fetch(NOVRA_SUPABASE_URL + '/rest/v1/' + path, {
    method: opts.method || 'GET',
    headers: Object.assign({
      apikey: NOVRA_SUPABASE_ANON_KEY,
      Authorization: 'Bearer ' + (opts.token || NOVRA_SUPABASE_ANON_KEY),
      'Content-Type': 'application/json'
    }, opts.headers || {}),
    body: opts.body ? JSON.stringify(opts.body) : undefined
  }).then(function (r) {
    if (!r.ok) return r.text().then(function (t) { throw new Error(t || r.status); });
    return r.status === 204 ? null : r.json();
  });
}
