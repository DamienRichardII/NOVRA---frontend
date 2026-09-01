# NOVRA — Mise en service du paiement Stripe

Tout le code est écrit et déployé. Ce qui reste tient en six étapes, à faire
dans l'ordre. Aucune ne demande de toucher au code.

**Ce que je ne fais pas, volontairement** : je ne crée pas votre compte
Stripe et je ne manipule aucune de vos clés. Vous seul les voyez, vous seul
les déposez. C'est la seule façon de garantir qu'elles ne traînent nulle part.

---

## 1. Créer le compte Stripe

Sur `dashboard.stripe.com/register`. Pour une activation complète, Stripe
demandera :

- le **SIRET** de DamCompany (ou de la structure qui encaisse) ;
- l'**IBAN** du compte qui recevra les virements ;
- une **pièce d'identité** du dirigeant ;
- l'adresse du site et une description de l'activité.

L'activation prend en général de quelques heures à deux jours. **On peut
développer et tester sans attendre** : Stripe donne des clés de test dès
l'inscription.

Frais en France, à vérifier sur `stripe.com/fr/pricing` avant de fixer les
prix : de l'ordre de 1,5 % + 0,25 € par carte européenne. Sur un t-shirt à
45 €, cela fait environ 0,93 €.

---

## 2. Déposer les clés dans Supabase

Dans Supabase → **Edge Functions** → **Secrets**, ajouter trois entrées :

| Nom | Où la trouver |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Développeurs → Clés API → *Clé secrète*. Commence par `sk_test_` en test, `sk_live_` en réel. |
| `STRIPE_WEBHOOK_SIGNING_SECRET` | Fourni à l'étape 3. Commence par `whsec_`. |
| `NOVRA_SITE_URL` | `https://novra-frontend.vercel.app` — sans barre finale. À remplacer par le vrai domaine le jour venu. |

**La clé secrète ne doit jamais figurer dans un fichier du projet.** Elle
autorise à elle seule des virements depuis votre compte. Si elle fuite, la
révoquer immédiatement depuis le tableau de bord Stripe.

---

## 3. Déclarer le webhook

Dans Stripe → **Développeurs** → **Webhooks** → *Ajouter un point de
terminaison*.

**Adresse :**

```
https://luvydsusnupkxvjfxsug.supabase.co/functions/v1/stripe-webhook
```

**Événements à cocher :**

- `checkout.session.completed`
- `checkout.session.expired`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `charge.refunded`

Stripe affiche alors un **secret de signature** (`whsec_…`) : c'est lui qui
va dans `STRIPE_WEBHOOK_SIGNING_SECRET` à l'étape 2.

À quoi il sert : le retour du navigateur après paiement ne prouve rien. Un
client peut fermer l'onglet, ou fabriquer l'adresse de confirmation. Une
commande n'est marquée payée que lorsque Stripe le dit lui-même, signature
vérifiée. C'est ce qui empêche quelqu'un de se déclarer payé sans l'être.

---

## 4. Tester avec les cartes de Stripe

En mode test, ces numéros fonctionnent avec n'importe quelle date future et
n'importe quel CVC :

| Carte | Résultat attendu |
|---|---|
| `4242 4242 4242 4242` | Paiement accepté |
| `4000 0025 0000 3155` | Demande une authentification 3D Secure |
| `4000 0000 0000 9995` | Refusée pour fonds insuffisants |
| `4000 0000 0000 0002` | Refusée par la banque |

**Le parcours à vérifier, de bout en bout :**

1. Ajouter un article au panier, aller jusqu'au paiement.
2. Payer avec `4242…` → vous arrivez sur la page de confirmation avec une
   référence `NVR-…`.
3. Dans l'admin → **Commandes** : la commande apparaît, statut *Payée*.
4. Dans l'admin → **CRM Clients** : la fiche client a été créée.
5. Dans l'admin → **Stocks** : la quantité a baissé, et un mouvement *Vente*
   est tracé.
6. Refaire un paiement puis **abandonner** sur la page Stripe → retour au
   panier, articles conservés, commande annulée en base.

Si la commande reste bloquée sur *En attente*, le webhook n'arrive pas :
vérifier dans Stripe → Webhooks que les tentatives sont en succès, et que le
secret de signature déposé correspond bien.

---

## 5. Vérifier ce qui reste bloquant

Trois points doivent être réglés **avant** d'encaisser un euro réel.

**Les prix sont provisoires.** Le catalogue affiche 35 à 120 €, des valeurs
posées pour construire le site. Ils vivent à deux endroits qui doivent rester
identiques : `js/products.js` (ce que le client voit) et la table `products`
(ce qui est réellement facturé). C'est la base qui fait foi au moment du
paiement — un prix corrigé d'un seul côté ferait payer autre chose que ce qui
est affiché.

**Les stocks sont à zéro.** Aujourd'hui la boutique vend sans compter, car le
suivi est désactivé. Une fois les quantités saisies dans l'admin → Stocks,
cliquer sur **Activer le suivi**. À partir de là, une taille en rupture n'est
plus commandable.

**Les mentions légales sont incomplètes.** Vendre en ligne en France impose
d'identifier l'éditeur : raison sociale, RCS, numéro de TVA, adresse,
directeur de publication, hébergeur. Les CGV doivent mentionner le droit de
rétractation de quatorze jours et les modalités de remboursement. Ce n'est pas
une formalité : c'est ce que le client oppose en cas de litige.

---

## 6. Passer en réel

1. Terminer l'activation du compte Stripe.
2. Dans Stripe, basculer du mode test au mode réel.
3. Remplacer `STRIPE_SECRET_KEY` par la clé `sk_live_…`.
4. Recréer le webhook en mode réel et remplacer `STRIPE_WEBHOOK_SIGNING_SECRET`.
5. Faire une vraie commande de 1 € sur un produit temporaire, vérifier
   l'arrivée sur le compte bancaire, puis rembourser depuis Stripe et
   contrôler que l'admin passe bien la commande en *Remboursée*.

---

## Ce qui n'est pas encore fait

- **Aucun e-mail n'est envoyé par NOVRA.** Stripe envoie son propre reçu de
  paiement, mais il n'y a ni confirmation de commande, ni avis d'expédition à
  vos couleurs. Cela demande un service d'envoi (Resend, Brevo) et une
  septième fonction.
- **Le suivi de livraison n'existe pas.** La colonne `tracking_number` est
  prête en base, l'écran pour la saisir reste à faire.
- **Les retours et remboursements se font depuis Stripe**, pas depuis
  l'admin. Le remboursement s'y répercute automatiquement, mais l'initier
  demande d'ouvrir le tableau de bord Stripe.
- **Aucune facture n'est générée.** Stripe peut le faire nativement, à
  activer dans ses réglages.

---

## Comment c'est construit

Trois fonctions tournent chez Supabase, à côté de la base :

`create-checkout-session` — appelée quand le client valide son panier. Elle
**relit les prix, les stocks et les remises dans la base** au lieu de croire
le navigateur : un panier modifié dans la console du navigateur paie quand
même le bon montant. Elle enregistre la commande en *attente*, puis ouvre la
page de paiement Stripe.

`stripe-webhook` — appelée par Stripe, jamais par le navigateur. Elle vérifie
la signature, marque la commande payée, sort le stock, crée la fiche client.
Elle sait reconnaître un événement rejoué : Stripe peut envoyer deux fois le
même message, le stock ne baisse qu'une fois.

`order-status` — permet à la page de confirmation d'afficher la commande sans
donner au visiteur l'accès à la table des commandes. Elle ne renvoie que ce
qui concerne le paiement présenté, avec l'adresse e-mail partiellement
masquée.
