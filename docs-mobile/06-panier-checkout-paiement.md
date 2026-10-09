# 06 — Panier, checkout et paiement

## Panier ✅ (`js/cart.js`, clé `novra_cart_v1`)

- Ligne = `{ slug, color, size, qty }`. Pas de prix stocké : le prix est relu du catalogue à l'affichage.
- Fusion des lignes identiques (même slug+couleur+taille) ; `qty` 1–20 ; maximum 40 lignes (limites du serveur).
- Persistance locale (zustand + AsyncStorage) ; badge sur l'onglet Panier.
- Livraison offerte au-delà de **80 €** (barre de progression « Plus que X € pour la livraison offerte »). Constantes à lire de la config, pas à disperser dans les écrans.
- Panier **réconcilié au démarrage** avec le catalogue : produit inactif ou taille disparue → ligne signalée et bloquante.

## Parcours checkout (4 étapes, un seul écran défilant ou pile de 4 écrans)

| Étape | Contenu | Règles |
|---|---|---|
| 01 Coordonnées | prénom, nom, e-mail, téléphone | Tous obligatoires (téléphone inclus ✅). Autofill natif (`textContentType`, `autoComplete`) |
| 02 Mode de réception | standard / express / relais / retrait | Retrait **masqué** si la boutique n'a pas adresse+ville ✅ ; afficher adresse et horaires de `store_settings` |
| 03 Adresse | adresse, complément, CP, ville, pays (FR, BE, CH, LU) | Si `pickup` : étape supprimée. Si `relay` : libellés « Point relais souhaité / Nom et adresse du point relais / Code postal du point relais / Ville du point relais », complément masqué ✅ |
| 04 Paiement | carte (SumUp), cases CGV + confidentialité | Case CGV obligatoire. Bouton « Valider la commande » |

Récapitulatif permanent : lignes, sous-total, livraison, remise, total. Champ code promo avec retour immédiat ; rappel : le serveur peut ignorer un code invalide.

Validation côté app = confort ; **le serveur reste juge** (mêmes limites que le schéma Zod, voir 04).

## Paiement SumUp Hosted Checkout ✅

1. L'app appelle `create-order` (clé d'idempotence générée à l'ouverture du checkout).
2. Elle ouvre `checkout_url` avec `WebBrowser.openAuthSessionAsync(checkout_url, redirectUrl)`.
3. Retour : l'app **n'interprète jamais l'URL de retour comme preuve**. Elle appelle `order-status` (`ref` + `t`) et lit `paid / failed / expired`.
4. Si `pending` (webhook pas encore reçu) : sonder toutes les 2 s pendant 30 s, puis écran « Paiement en cours de vérification » avec bouton Actualiser et lien vers le suivi.
5. Vider le panier **seulement** quand `paid` est vrai.

```ts
async function pay(form: CheckoutForm) {
  const key = getOrCreateIdempotencyKey();           // persisté jusqu'au paiement
  const r = await fetch(`${URL}/functions/v1/create-order`, { method:'POST',
    headers:{ 'Content-Type':'application/json', apikey: KEY },
    body: JSON.stringify({ lines: cartLines(), email: form.email, shipping: form.shipping,
      promo: form.promo, idempotency_key: key, address: form.address, client: 'app' }) });
  const data = await r.json();
  if (!r.ok) throw new UserFacingError(data.error);
  await saveLastOrder({ reference: data.reference, token: data.access_token, email: form.email });
  await WebBrowser.openAuthSessionAsync(data.checkout_url, 'novra://commande');
  return pollOrder(data.reference, data.access_token);
}
```

(`client: 'app'` suppose l'évolution **B1** de 04. Tant qu'elle n'existe pas, la page web de confirmation s'affiche dans le navigateur intégré que l'utilisateur ferme à la main : l'app relit alors `order-status` à la fermeture.)

## Apple Pay / Google Pay

SumUp Hosted Checkout les propose dans sa page web (« Visa, Mastercard, CB, Apple Pay et Google Pay » ✅). Pas de SDK natif au lancement.

## Cas d'échec à couvrir

| Situation | Comportement |
|---|---|
| Rupture / produit retiré (409) | Message serveur ; retour au panier avec ligne en cause marquée |
| Fournisseur indisponible (502/504) | « Le paiement est momentanément indisponible. Réessayez… » ; conserver la même clé |
| Paiement refusé / expiré | `failed` / `expired` : proposer de réessayer (nouvelle clé) |
| Utilisateur ferme le navigateur | Sonder `order-status` ; si `pending`, proposer « Reprendre le paiement » (même clé → même session) |
| Pas de réseau | Bouton désactivé + bandeau |

## Ce que l'app ne fait jamais

Pas de montant envoyé, pas de statut « payée » déduit du client, pas de numéro de carte saisi dans l'app, aucune clé secrète ✅.
