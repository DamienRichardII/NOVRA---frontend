# 04 — Backend Supabase et contrats d'API

Projet actuel : `luvydsusnupkxvjfxsug`. **L'app n'ajoute aucun serveur** : elle parle à Supabase (lecture publique RLS) et à trois fonctions Edge. ⚠ Un déplacement vers un autre projet est envisagé (voir 12) : tout passe par `EXPO_PUBLIC_SUPABASE_URL`.

## Tables utiles à l'app

| Domaine | Tables | Accès client (clé publiable) |
|---|---|---|
| Catalogue | `products`, `product_variants` | Lecture des produits actifs |
| Contenus | `pages`, `page_sections`, `section_media`, `media_library` | Lecture du publié |
| Commerce | `orders`, `order_items`, `order_events`, `payments`, `customers`, `promotions`, `stock_movements`, `email_outbox`, `store_settings` | **Aucun accès direct**. Passer par les fonctions |
| Admin | `admin_profiles`, `admin_invitations`, `activity_log`, `content_versions`, `section_drafts` | Utilisateur authentifié + `is_admin()` |

Montants : `numeric` en euros dans les tables ; centimes entiers dans les calculs serveur ✅.

## Fonctions Edge (publiques, `verify_jwt` désactivé)

Base : `${SUPABASE_URL}/functions/v1/…`, en-têtes `apikey: <clé publiable>` et `Content-Type: application/json`.

### `POST create-order`

Requête (schéma Zod du serveur ✅) :

```json
{
  "lines": [{ "slug": "t-shirt-x", "color": "Noir", "size": "M", "qty": 1 }],
  "email": "client@exemple.fr",
  "shipping": "standard",            // standard | express | relay | pickup
  "promo": "BIENVENUE10",            // facultatif
  "idempotency_key": "uuid-v4",      // facultatif mais obligatoire côté app
  "address": { "firstname":"", "lastname":"", "phone":"", "address":"", "address2":"", "zip":"", "city":"", "country":"FR" },
  "billing": null
}
```

Réponse 200 :

```json
{ "reference": "NVR-261009-A1B2", "access_token": "<48 hex>", "checkout_id": "…", "checkout_url": "https://…sumup…" }
```

Erreurs : `{ "error": "message en français", "code": "PRODUCT_INACTIVE | VARIANT_GONE | … | PROVIDER" }` avec statut 400/409/502/504. **Afficher `error` tel quel** (déjà destiné au client).

Règles serveur (jamais à recalculer comme source de vérité) ✅ :

| Mode | Prix | Particularité |
|---|---|---|
| `standard` | 4,90 € — **offert dès 80 €** | Adresse obligatoire (`address`, `zip`, `city`) |
| `express` | 9,90 € | idem |
| `relay` | 2,90 € | L'adresse saisie = nom + adresse du point relais |
| `pickup` | gratuit | Adresse inutile ; actif seulement si la boutique a adresse + ville (`store_settings`) |

- Prix, remises, stock relus en base. Code promo invalide → **ignoré**, la commande continue (afficher l'écart au récapitulatif).
- Types de promo : `percent`, `amount`, `free_shipping` ; conditions : actif, dates, `max_uses`, `min_amount`.
- Stock : refus seulement si `products.track_inventory` est vrai et stock insuffisant (code de rupture).
- Idempotence : même `idempotency_key` + commande encore `pending` → renvoie la même session de paiement. **Générer la clé une fois par tentative de panier** et la conserver jusqu'au retour du paiement.
- Le montant n'est jamais lu depuis l'app.

### `GET order-status`

Deux modes, au choix ✅ :

- Retour de paiement : `?ref=NVR-…&t=<access_token>` (jeton de 48 hex).
- Suivi : `?reference=NVR-…&email=<e-mail>` — **référence ET e-mail, jamais la référence seule**.

Format de référence : `NVR-AAMMJJ-XXXX` (regex `^NVR-\d{6}-[A-Z0-9]{4}$`).

Réponse : `reference, status, paid, cancelled, failed, expired, fulfilment, email (masqué), address (réduite : ville/CP/pays, complète seulement avec le jeton), store (si retrait), shipping_method, payment_method, carrier, tracking_number, tracking_url, promo_code, subtotal, shipping, discount, total, created_at, paid_at, shipped_at, ready_at, completed_at, payment_failed_at, payment_expired_at, items[], events[]`. Erreurs 400/404 avec message français.

### `POST sumup-webhook`

Réservé à SumUp. **L'app ne l'appelle jamais.** SumUp ne signe pas ses webhooks : le serveur rappelle `GET /v0.1/checkouts/{id}` et seule cette réponse décide ✅. Ne rien changer à ce chemin.

### `POST send-order-email`

Réservé au serveur (déclencheur base + tâche planifiée toutes les 5 min). Voir 08 pour l'extension push.

## Lecture directe du catalogue (clé publiable)

```ts
const { data } = await supabase
  .from('products')
  .select('id, slug, name, price, status, images, track_inventory, product_variants(id, color, size, stock)')
  .eq('status', 'active');
```

⚠ Valider les colonnes réelles avec `generate_typescript_types` avant de coder (la structure complète est dans `MIGRATION-NOVRA.md` / le dump). Les champs textuels (description, matières, entretien, guide de coupe) viennent du **repli embarqué** `js/products.js` ✅ : voir 05.

## Authentification admin

Supabase Auth e-mail + mot de passe (comme `admin/`). Profil via `admin_profiles` (rôle). Fonctions : `is_admin()`, `admin_role_of()`, `can_edit_content()`, `publish_section()`, `restore_version()`, `admin_dashboard_stats()` — toutes `SECURITY DEFINER`, exécutables par `authenticated` uniquement ✅. Détail en 10.

## Évolutions backend nécessaires pour l'app 🛠

| # | Besoin | Détail |
|---|---|---|
| B1 | **Retour de paiement vers l'app** | `create-order` fixe `redirectUrl = SITE + '/confirmation.html?ref=…&t=…'`. Ajouter un champ facultatif `client: 'app'` : alors `redirectUrl` = page web légère `https://novra.paris/app-retour.html?ref=…&t=…` qui redirige vers `novra://commande/<ref>?t=<jeton>` (Universal/App Links). Le web reste inchangé |
| B2 | **Jetons push** | Table `push_tokens(id, token unique, platform, order_id nullable, created_at)` avec RLS : insertion publique contrôlée (via fonction Edge `register-push`), lecture serveur seulement |
| B3 | **Envoi push** | Étendre `send-order-email` (ou fonction sœur) : à chaque ligne `order_events`, envoyer une notification via l'API Expo Push aux jetons liés à la commande |
| B4 | **Configuration distante** | Version minimale d'app exigée (`store_settings` ou table `app_config`) pour forcer la mise à jour |
| B5 | **Reçu PDF** | Facultatif : fonction Edge générant un PDF (le web imprime depuis le navigateur) |

Chaque évolution B1–B3 est détaillée dans 06 et 08.
