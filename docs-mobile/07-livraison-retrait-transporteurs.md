# 07 — Livraison, retrait et transporteurs

## Modes de réception ✅ (`orders.fulfilment`)

| `shipping` envoyé | Libellé | `fulfilment` | Prix |
|---|---|---|---|
| `standard` | Livraison standard — 24-48 h ouvrées | `delivery` | 4,90 € (0 dès 80 €) |
| `express` | Livraison express — 24 h, commande avant 12 h | `delivery` | 9,90 € |
| `relay` | Point relais — 2-4 jours ouvrés | `relay` | 2,90 € |
| `pickup` | Retrait en boutique | `pickup` | Gratuit |

## Retrait en boutique

Visible dans le checkout **uniquement** si `store_settings` contient adresse **et** ville (à renseigner depuis l'écran Paramètres de l'admin : adresse, CP, ville, téléphone, e-mail, horaires, consigne de retrait). Tant que ce n'est pas fait, l'option reste masquée ✅ — l'app doit lire cette config (via `order-status.store` après commande ; pour le checkout, prévoir une lecture publique minimale ou une fonction dédiée 🛠).

⚠ `store_settings` n'est pas lisible publiquement : **évolution B6** — exposer `adresse, ville, CP, horaires` via une vue/fonction publique restreinte, ou via un champ renvoyé par un nouvel endpoint `GET store-info`.

Commande retrait : cycle `paid → preparing → ready_for_pickup → picked_up`. À « prête », message avec adresse, horaires et consigne ; présenter **référence + pièce d'identité** (à confirmer dans `pickup_note`).

## Point relais — état réel ⚠

Il n'existe **pas** de sélecteur de point relais ni d'intégration transporteur. Le client saisit à la main le nom et l'adresse du relais (texte d'aide : à trouver sur mondialrelay.fr). L'app reprend ce comportement au lancement.

Évolution recommandée (V2) : widget officiel Mondial Relay / Boxtal dans une WebView, ou API de recherche de points ; enregistrer l'identifiant du relais dans `orders.address`.

## Transporteurs

Colissimo, Mondial Relay, Chronopost sont les cibles métier, mais **aucune API n'est branchée** : l'expédition est manuelle. L'admin saisit `carrier`, `tracking_number`, `tracking_url` lors du passage à « Expédiée » ; ces champs apparaissent dans `order-status` ✅.

Côté app : sur la commande expédiée, bouton « Suivre mon colis » → `Linking.openURL(tracking_url)` ; sinon afficher transporteur + numéro avec copie en un tap.

## Pays desservis

France, Belgique, Suisse, Luxembourg ✅. Pas de tarif par pays aujourd'hui (tarif unique) ; à signaler pour la Suisse (douane) — décision commerciale ouverte.

## Étiquettes et bordereaux

Non gérés. L'admin mobile affiche l'adresse et permet de copier ; pas d'impression d'étiquette en V1.
