# 08 — Commandes, suivi et notifications

## Cycle de vie ✅

- Livraison / relais : `pending → paid → preparing → shipped → delivered`
- Retrait : `pending → paid → preparing → ready_for_pickup → picked_up`
- Hors cycle : `cancelled`, `payment_failed`, `payment_expired`.

« Payée » est posé **exclusivement** par `apply_payment_result()` (déclencheur `orders_guard_paid`) : un administrateur ne peut pas le forcer ✅. Chaque changement écrit une ligne dans `order_events` (frise de suivi) et prépare un message dans `email_outbox`.

## Écran Commande (`commande/[reference]`)

Reprendre `js/order-view.js` ✅ : `Timeline` verticale selon `fulfilment` (étapes `OV_STEPS`), états spéciaux (annulée, échec, expirée), récapitulatif lignes + totaux, adresse ou boutique, bloc colis.

Actions : copier la référence, suivre le colis, **partager / enregistrer le reçu** (version imprimable du web ; en natif : `expo-print` pour produire un PDF avec en-tête NOVRA « Reçu de commande n° … ») 🛠.

## Suivi sans compte ✅

Écran « Suivre ma commande » : champs **référence** (`NVR-AAMMJJ-XXXX`) **et e-mail**, jamais la référence seule. Messages d'erreur du serveur affichés tels quels. Après un achat réussi, l'app mémorise `{reference, token, email}` en local (SecureStore) → onglet **Commandes** liste les commandes de cet appareil, relues via `order-status` à l'ouverture.

Jeton `t` (48 hex) : donne accès à l'adresse complète ; ne jamais le journaliser ni le partager.

## E-mails ✅ (Resend, domaine `novra.paris`)

Envoyés par `send-order-email` (expéditeur `NOVRA <commandes@novra.paris>`), déclenchés par trigger sur `email_outbox` + relance toutes les 5 min (jusqu'à 5 tentatives). L'app n'envoie aucun e-mail.

## Notifications push 🛠 (évolution B2/B3)

| Événement (`order_events`) | Titre | Corps |
|---|---|---|
| paid | Commande confirmée | « Merci ! Votre commande NVR-… est bien reçue. » |
| shipped | Commande expédiée | « Elle est en route. Suivez votre colis. » |
| ready_for_pickup | Commande prête | « Vous pouvez la retirer en boutique. » |
| delivered / picked_up | Livrée / Retirée | « Bonne séance ! » |

Mise en œuvre :

1. À l'autorisation de notifications (demandée **après le premier achat**, pas au premier lancement), l'app obtient un `ExpoPushToken` et appelle `register-push { token, platform, reference, access_token }`. La fonction vérifie le couple référence/jeton avant d'enregistrer.
2. Le serveur envoie via `https://exp.host/--/api/v2/push/send` ; supprimer les jetons rejetés (`DeviceNotRegistered`).
3. Lien profond de la notification : `novra://commande/<ref>` (la commande est retrouvée dans le stockage local de l'appareil).

Notifications **transactionnelles uniquement** au lancement ; pas de marketing sans consentement explicite (voir 11).

## Liens profonds

`novra://commande/<ref>?t=<jeton>`, `novra://produit/<slug>`, `novra://boutique?cat=…`. Universal Links / App Links pour `https://novra.paris/product.html?slug=…` et `suivi.html` 🛠 (fichiers `apple-app-site-association` et `assetlinks.json` à déposer sur le domaine).
