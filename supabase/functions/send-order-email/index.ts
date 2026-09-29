/* =========================================================================
   NOVRA — Envoi des e-mails transactionnels

   `email_outbox` est remplie par le déclencheur `log_order_status()` à
   chaque changement de statut de commande (payée, en préparation, expédiée,
   livrée, prête au retrait, retirée, annulée, remboursée). Cette fonction
   est la seule à lire cette file et à réellement envoyer les messages,
   via Resend. Avant elle, aucun message ne partait : la file s'accumulait
   sans jamais être vidée.

   Appelée de deux façons :
   - immédiatement après chaque insertion (déclencheur SQL + pg_net),
     avec { id } dans le corps pour traiter une seule ligne ;
   - toutes les 5 minutes par pg_cron, sans corps, en filet de sécurité
     pour tout message qui n'aurait pas pu partir du premier coup.
   ========================================================================= */

import { createClient } from 'npm:@supabase/supabase-js@^2';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
);

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
/* Adresse d'expédition : à corriger via le secret RESEND_FROM si le domaine
   vérifié dans Resend n'est pas novra.paris. */
const FROM = Deno.env.get('RESEND_FROM') || 'NOVRA <commandes@novra.paris>';
const MAX_ATTEMPTS = 5;

function money(n: unknown) {
  return (Number(n) || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function esc(v: unknown) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* Un seul gabarit, un texte d'intro différent par type de message : c'est
   la même sobriété que le reste du site (noir/blanc, pas de fioritures). */
const INTRO: Record<string, (p: any) => string> = {
  order_confirmed:  (p) => `Votre commande <strong>${esc(p.reference)}</strong> est confirmée. Merci pour votre achat.`,
  order_preparing:  (p) => `Votre commande <strong>${esc(p.reference)}</strong> est en cours de préparation.`,
  order_shipped:    (p) => `Votre commande <strong>${esc(p.reference)}</strong> a été expédiée` +
                           (p.carrier ? ` par ${esc(p.carrier)}` : '') + '.',
  order_delivered:  (p) => `Votre commande <strong>${esc(p.reference)}</strong> a été livrée. Nous espérons qu'elle vous plaît.`,
  order_ready:      (p) => `Votre commande <strong>${esc(p.reference)}</strong> est prête à être retirée en boutique.`,
  order_picked_up:  (p) => `Votre commande <strong>${esc(p.reference)}</strong> a bien été retirée. Merci !`,
  order_cancelled:  (p) => `Votre commande <strong>${esc(p.reference)}</strong> a été annulée. Si un montant a été débité, il vous est restitué automatiquement par votre banque sous quelques jours.`,
  order_refunded:   (p) => `Votre commande <strong>${esc(p.reference)}</strong> a été remboursée.`
};

function renderHtml(kind: string, subject: string, payload: any) {
  const intro = (INTRO[kind] || (() => esc(subject)))(payload || {});
  const tracking = payload?.tracking_number
    ? `<p style="margin:18px 0 0;font-size:14px;color:#444">Numéro de suivi : <strong>${esc(payload.tracking_number)}</strong>` +
      (payload.tracking_url ? ` — <a href="${esc(payload.tracking_url)}" style="color:#0a0a0a">suivre le colis</a>` : '') + '</p>'
    : '';
  const total = payload?.total ? `<p style="margin:6px 0 0;font-size:14px;color:#444">Total : <strong>${money(payload.total)}</strong></p>` : '';

  return `<!doctype html><html><body style="margin:0;padding:32px 20px;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;color:#0a0a0a">
    <div style="max-width:520px;margin:0 auto;background:#fff;padding:32px 28px;border:1px solid #e4e4e4">
      <p style="font-family:Arial,sans-serif;font-weight:700;letter-spacing:.08em;font-size:20px;margin:0 0 24px">NOVRA</p>
      <p style="font-size:15px;line-height:1.6;margin:0">${intro}</p>
      ${total}${tracking}
      <p style="margin:28px 0 0;font-size:12px;color:#888">Vous pouvez suivre votre commande à tout moment sur
        <a href="https://novra.paris/suivi.html?reference=${encodeURIComponent(payload?.reference || '')}" style="color:#0a0a0a">novra.paris</a>.</p>
      <p style="margin:24px 0 0;font-size:11px;color:#aaa">NOVRA — 26 ter rue Jules Princet, 93600 Aulnay-sous-Bois</p>
    </div>
  </body></html>`;
}

async function sendOne(row: any) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY absente des secrets Supabase');

  const html = renderHtml(row.kind, row.subject, row.payload);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: FROM, to: [row.recipient], subject: row.subject, html })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status} : ${detail.slice(0, 300)}`);
  }
}

async function processRow(row: any) {
  try {
    await sendOne(row);
    await db.from('email_outbox').update({ status: 'sent', sent_at: new Date().toISOString() }).eq('id', row.id);
    return { id: row.id, ok: true };
  } catch (e) {
    const attempts = (row.attempts || 0) + 1;
    await db.from('email_outbox').update({
      attempts,
      status: attempts >= MAX_ATTEMPTS ? 'failed' : 'queued',
      last_error: String((e as Error).message || e).slice(0, 500)
    }).eq('id', row.id);
    return { id: row.id, ok: false, error: String((e as Error).message || e) };
  }
}

Deno.serve(async (req) => {
  let body: any = {};
  try { body = await req.json(); } catch { /* appel sans corps : mode filet de sécurité */ }

  let rows;
  if (body?.id) {
    const { data } = await db.from('email_outbox').select('*').eq('id', body.id).eq('status', 'queued').limit(1);
    rows = data || [];
  } else {
    const { data } = await db.from('email_outbox').select('*').eq('status', 'queued').order('created_at').limit(20);
    rows = data || [];
  }

  const results = [];
  for (const row of rows) results.push(await processRow(row));

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
