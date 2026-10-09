# 10 — Espace admin mobile

Périmètre V1 : **ce qu'un gérant fait debout dans l'atelier ou la boutique** — voir et traiter les commandes, ajuster les stocks, changer un prix, consulter le tableau de bord. L'édition de contenus riche reste sur l'admin web.

## Accès et rôles ✅

- Connexion Supabase Auth (e-mail + mot de passe). Session dans `expo-secure-store`. Déverrouillage biométrique à la réouverture 🛠.
- Entrée : écran caché (Réglages → « Espace pro », ou lien `novra://admin`). Le profil est lu dans `admin_profiles` ; sans profil, déconnexion immédiate.
- Rôles et écrans (de `ROLE_VIEWS`) :

| Rôle | Écrans |
|---|---|
| `super_admin` | tous |
| `manager` | dashboard, commandes, produits, collections, stocks, promotions, clients, contenus, médiathèque, analytics, journal, paramètres |
| `marketing` | dashboard, contenus, médiathèque, promotions, newsletter, analytics |
| `support` | dashboard, clients, commandes, avis, SAV |

- Édition autorisée pour `super_admin`, `manager`, `marketing` (`canEdit()` / `can_edit_content()`) ; `support` en lecture. **L'interface masque, la base impose** (RLS) : ne jamais se fier au seul masquage.

## Écrans V1 mobile

| Écran | Reprend | Détails |
|---|---|---|
| **Tableau de bord** | `admin_dashboard_stats()` | Commandes du jour, chiffre payé, à préparer. **État vide explicite** si aucune donnée (aucun chiffre de démonstration ✅) |
| **Commandes** | écran Commandes | Liste filtrable par statut **et par mode** (livraison/relais/retrait — filtre non encore présent au web 🛠), détail, bouton d'étape suivante |
| **Stocks** | écran Stocks refondu | Recherche, filtre produit/état, tri produit→couleur→taille, **pas de plafond d'affichage** ✅ (ancien bug : `slice(0,120)`), saisie rapide +/−, interrupteur de suivi `track_inventory` |
| **Produits** | écran Produits | Prix (confirmation si écart > ×2 ✅), statut, photos (ajout/ordre/retrait, enregistrées aussitôt ✅) |
| **Promotions** | écran Promotions | Création/arrêt d'un code (`percent`, `amount`, `free_shipping`) |
| **Clients** | CRM | Lecture seule |

Hors V1 mobile : Médias & Contenus, Médiathèque, Newsletter, Analytics détaillé, Administrateurs, Paramètres, Journal (consultation seule possible plus tard).

## Traitement d'une commande

Étapes suivantes proposées selon `fulfilment` (`NEXT_STATUS`/`STATUS_ACTION` de l'admin ✅) :

- Livraison/relais : paid → *Préparer* → preparing → *Marquer expédiée* (saisie **transporteur + numéro + lien de suivi**) → shipped → *Marquer livrée*.
- Retrait : paid → *Préparer* → *Prête au retrait* → *Retirée*.

Chaque passage écrit `order_events` et prépare l'e-mail (et le push, B3) ✅. Aucun bouton « Marquer payée » : **interdit** (trigger `orders_guard_paid`) ✅. Pour un relais, afficher en tête « Point relais : <texte saisi par le client> » ✅.

## Stocks — règles

- Source unique : `product_variants.stock` ; chaque modification écrit `stock_movements` (qui, avant/après, motif) ✅.
- Avec `track_inventory = false`, la boutique vend sans compter : l'écran l'indique clairement et propose l'activation (décision métier ouverte : les 88 variantes sont à 0 aujourd'hui ⚠ — **activer le suivi sans saisir les stocks bloquerait toutes les ventes**).
- Décrément automatique : uniquement à la confirmation de paiement (`apply_payment_result()`).

## Sécurité spécifique

- Aucune clé `service_role` dans l'app. Toutes les écritures passent par RLS avec le JWT de l'admin.
- Journaliser dans `activity_log` (les actions critiques le font déjà côté web ; vérifier l'équivalence).
- Verrouillage après 5 min d'inactivité ; pas de capture d'écran sur les écrans clients (FLAG_SECURE Android) 🛠.
- Invitations d'admins : web uniquement.
