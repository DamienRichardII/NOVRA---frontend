# NOVRA — Site officiel

Site statique HTML5 / CSS3 / JavaScript vanilla. Aucun framework, aucun build, aucun CMS.
Lire aussi `Damcompany-code-guardrails.md` avant toute intervention.

## Structure

```
index.html  marketplace.html  product.html  cart.html  checkout.html
confirmation.html  suivi.html
about.html  contact.html  mentions-legales.html  politique-confidentialite.html  cgv.html
css/   style.css (design system) · responsive.css · animations.css
js/    products.js (catalogue) · main.js (noyau) · cart.js · marketplace.js · product.js · checkout.js · contact.js · home.js
js/    cms.js (pont vers Supabase) · supabase-config.js (clé publiable)
js/    order-view.js (rendu commande partagé) · confirmation.js · suivi.js
supabase/functions/  _shared/sumup.ts · create-order · sumup-webhook · order-status
admin/ index.html · admin.js (noyau, CMS, médiathèque) · admin-pages.js (écrans) · admin-ui.js (composants)
assets/       médias originaux fournis par le client — NE PAS modifier, renommer ou supprimer
assets/web/   versions optimisées pour le web (générées) — utilisées par le site
```

## Base de données (Supabase, projet `luvydsusnupkxvjfxsug`)

Contenus éditoriaux : `pages`, `page_sections`, `section_drafts`, `section_media`, `media_library`,
`content_versions`, `activity_log`, `admin_profiles`, `admin_invitations`.

Commerce : `products` (11 produits réels), `product_variants` (88 SKU), `stock_movements`,
`customers`, `orders`, `order_items`, `promotions`, `order_events`, `email_outbox`,
`store_settings`, `payments`, `payment_events`.

Fonctions : `is_admin()`, `admin_role_of()`, `can_edit_content()`, `publish_section()`,
`restore_version()`, `admin_dashboard_stats()`. Toutes en `SECURITY DEFINER`, `EXECUTE` révoqué
de `public` et `anon`, accordé à `authenticated` uniquement.

Le navigateur ne reçoit jamais que la clé publiable. La sécurité repose entièrement sur les
règles RLS : ne jamais placer de `service_role` dans un fichier JavaScript.

## Règles projet

- **Catalogue** : le site public lit `js/products.js`. La base contient le même catalogue, importé à l'identique, et c'est elle que lit l'admin. Les deux doivent rester synchronisés tant que le site ne lit pas la base ; c'est pourquoi les champs nom / prix / description sont en lecture seule dans l'admin. Ne jamais écrire un prix ou un nom de produit en dur dans un HTML.
- **Stocks** : uniquement en base (`product_variants.stock`), modifiables depuis l'écran Stocks de l'admin. Chaque changement écrit une ligne dans `stock_movements`.
- **Aucune donnée inventée** dans l'admin : si une table est vide, l'écran affiche un état vide qui explique ce qui manque, jamais des chiffres de démonstration.
- **Header et footer** : générés par `renderHeader()` / `renderFooter()` dans `js/main.js`. Une seule source, ne pas dupliquer dans les pages.
- **Cartes produits** : `productCardMarkup()` dans `js/main.js`. Utilisée par l'accueil, la marketplace, la fiche produit et le panier.
- **Panier** : objet `Cart` dans `js/cart.js`, persistance `localStorage` (clé `novra_cart_v1`).
- **Paiement** : SumUp Hosted Checkout. `processPayment()` dans `js/checkout.js` appelle `create-order`, qui recalcule prix, stocks et remises depuis la base. Ne jamais faire confiance à un montant venu du navigateur. Voir `SUMUP.md`.
- **Preuve de paiement** : SumUp ne signe pas ses webhooks. Le corps reçu n'est jamais une preuve : `sumup-webhook` rappelle `GET /v0.1/checkouts/{id}` et c'est cette réponse seule qui décide. Ne jamais raccourcir ce chemin.
- **Montants** : centimes entiers en base et côté serveur. Conversion en euros décimaux uniquement à la frontière SumUp. Jamais de flottant dans un calcul métier.
- **Statut « payée »** : posé exclusivement par `apply_payment_result()`. Un administrateur ne peut pas le forcer (déclencheur `orders_guard_paid`).
- **Clés secrètes** : uniquement dans les secrets Supabase (`SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `SUMUP_WEBHOOK_URL`, `NOVRA_SITE_URL`). Jamais dans un fichier du dépôt.
- **Suivi des stocks** : `products.track_inventory`. Éteint, la boutique vend sans compter ; allumé depuis l'écran Stocks, une rupture bloque la commande.
- **Modes de réception** : `orders.fulfilment` vaut `delivery`, `relay` ou `pickup`. Le retrait n'apparaît dans le tunnel que si `store_settings` contient une adresse et une ville.
- **Cycle de vie** : `pending → paid → preparing → shipped → delivered` en livraison, `→ ready_for_pickup → picked_up` en retrait. Chaque changement écrit une ligne dans `order_events` (page de suivi) et prépare un message dans `email_outbox`.
- **Suivi client** : sans compte. `suivi.html` interroge `order-status` avec référence **et** e-mail. Ne jamais accepter la référence seule.
- **E-mails** : `email_outbox` accumule les messages, **aucun n'est envoyé** — aucun prestataire n'est branché. Y greffer l'envoi plus tard, ne pas créer un second système.
- **Direction artistique** : noir `#0a0a0a`, blanc, gris. Aucune couleur d'interface. Les couleurs vives ne viennent que des photos produits.
- **Typographie** : Barlow Condensed (titres, majuscules) + Inter (textes).

## Assets

- Les originaux (~2,3 Go) restent intacts dans `assets/`.
- `assets/web/` contient les dérivés utilisés en production : photos 1400 px qualité 80, vidéo hero MP4 H.264 720p + poster, logos et favicon.
- Pour régénérer une image : redimensionner à 1400 px max, `-auto-orient`, qualité 80, JPEG progressif.

## Points à compléter avant mise en ligne

- Prix réels (actuellement provisoires, 35 à 120 €) — à corriger dans `js/products.js` **et** dans la table `products`.
- Saisie des stocks réels : les 88 variantes sont à 0 (écran Stocks de l'admin).
- Mentions légales : éditeur, RCS, TVA, hébergeur, directeur de publication.
- Domaine réel dans les balises `canonical` et Open Graph (actuellement `https://www.novra.fr/`).
- Clés SumUp à déposer dans les secrets Supabase (voir `SUMUP.md`). Tant qu'elles manquent, aucun paiement n'aboutit et les écrans Commandes, CRM et Analytics restent vides — c'est normal et assumé.
- Coordonnées de la boutique physique (écran Paramètres de l'admin) : sans elles, l'option « Retrait en boutique » reste masquée dans le tunnel.
- Envoi des e-mails : choisir un prestataire et lire `email_outbox`. Aucun message ne part aujourd'hui.
- Formulaires contact et newsletter : aucune adresse saisie n'est enregistrée aujourd'hui.
- Activer la protection contre les mots de passe compromis dans Supabase Auth (Authentication → Policies).

## Vérifications attendues après chaque intervention

- Aucune erreur console.
- Pas de débordement horizontal à 320, 375, 768, 1024 et 1440 px.
- Panier persistant après rechargement.
- Tous les liens et boutons visibles ont un comportement réel.
