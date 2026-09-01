# NOVRA — Audit du parcours client

Audit réalisé le 1er septembre 2026, puis complété. Tout ce qui est décrit
ci-dessous a été vérifié par des tests, pas seulement lu dans le code.

---

## ✅ Fonctionnalités déjà présentes

**Panier** — ajout, modification des quantités (bornée de 1 à 20), suppression,
recalcul automatique, persistance `localStorage`, survie au rechargement.

**Paiement** — Stripe Checkout, prix et stocks recalculés côté serveur à partir
de la base. Un panier modifié dans la console du navigateur paie quand même le
bon montant.

**Commande** — numéro unique `NVR-AAMMJJ-XXXX`, lignes détaillées, prix
unitaires, sous-total, frais de port, remise, total, mode de paiement.

**Webhook** — signature Stripe vérifiée, commande marquée payée, stock sorti,
fiche client créée. Un événement rejoué ne décrémente le stock qu'une fois.

**Codes promo** — lus en base, revalidés au moment du paiement.

**Admin** — liste des commandes, détail, catalogue réel, stocks éditables,
médias et contenus du site, journal d'activité.

---

## ❌ Fonctionnalités manquantes à l'audit

- Aucun retrait en boutique : « Point relais » était le seul mode alternatif,
  sans adresse ni horaires.
- Aucun cycle de vie : une commande passait de `paid` à… rien. Pas de
  préparation, pas d'expédition, pas de livraison.
- Aucun moyen pour le client de suivre sa commande après le paiement.
- Aucune trace d'historique : impossible de savoir quand une étape avait eu lieu.
- L'administrateur ne pouvait pas changer un statut ni saisir un numéro de suivi.
- Trois moyens de paiement affichés (carte, PayPal, virement) dont deux
  n'existaient pas.
- La mention « aucun paiement n'est réellement encaissé » était toujours là,
  alors que Stripe encaisse désormais pour de vrai.
- L'adresse postale restait obligatoire même pour un retrait.
- Rien n'empêchait un double clic de créer deux commandes.
- La confirmation n'affichait ni mode de réception, ni adresse, ni statut.
- Aucun e-mail transactionnel, ni même la mécanique pour en envoyer un jour.

---

## 🟢 Fonctionnalités ajoutées

### 🔴 Priorité 1 — indispensables

**Trois modes de réception.** Livraison standard, express, point relais et
retrait en boutique. Le retrait n'apparaît dans le tunnel **que si l'adresse de
la boutique est renseignée** : mieux vaut ne rien proposer que d'annoncer un
retrait impossible. Choisir le retrait masque l'étape d'adresse et lève
l'obligation de la remplir.

**Cycle de vie réel.** Deux parcours distincts, sans statut décoratif :

```
Livraison   reçue → payée → en préparation → expédiée → livrée
Retrait     reçue → payée → en préparation → prête à retirer → retirée
```

« En transit » n'a pas été créé : c'est le transporteur qui détient cette
information, et le lien de suivi y mène directement.

**Historique horodaté.** Chaque changement écrit une ligne dans `order_events`.
C'est elle qui alimente la frise du client — pas une reconstitution théorique.

**Page de suivi (`suivi.html`).** Sans compte : numéro de commande **et**
adresse e-mail. Les deux sont exigés — le numéro seul permettrait de lire la
commande d'un autre en devinant une référence. Le serveur renvoie le même
message d'échec que la commande n'existe pas ou que l'adresse ne corresponde
pas, pour ne rien révéler. Accessible depuis l'icône du header et le pied de page.

**Page de confirmation complète.** Numéro, frise d'avancement, articles, prix
unitaires, sous-total, remise, port, total payé, moyen de paiement, mode de
réception, adresse de livraison ou coordonnées de retrait, et deux boutons :
« Suivre ma commande », « Retourner à la boutique ».

**Gestion des commandes dans l'admin.** Filtres (à traiter, payées, en
préparation, expédiées, prêtes au retrait, livrées, retirées, annulées,
remboursées). Un seul bouton mis en avant : **l'étape suivante**, adaptée au
mode de réception. Saisie du transporteur, du numéro et du lien de suivi, mais
uniquement pour une livraison. Annulation possible.

**Réglages de la boutique.** Écran Paramètres : nom, adresse, code postal,
ville, téléphone, e-mail, horaires des sept jours, consigne de retrait. Ces
champs sont **réellement enregistrés** et pilotent l'affichage du retrait.

**Protection contre les doublons.** Le navigateur génère un jeton stable pour
un passage en caisse. Un double clic, un rechargement ou une reprise réseau
retombent sur la même commande et rouvrent la même page Stripe au lieu d'en
créer une seconde. Le bouton se verrouille aussi dès le premier clic.

### 🟠 Priorité 2

**Mécanique d'e-mails préparée, sans envoi.** Chaque changement de statut
dépose un message prêt à partir dans `email_outbox` : destinataire, objet,
référence, montant, mode de réception, transporteur, numéro de suivi, adresse.
Six messages sont générés — confirmation, préparation, expédition, livraison,
prête au retrait, retirée. **Aucun ne part** : aucun prestataire n'est branché.
Le jour où une clé d'envoi sera déposée, il suffira de lire cette file. Il n'y
aura pas de second système à créer.

**Panier vide.** Le bouton de validation se désactive et affiche « Panier
vide », avec un lien vers la boutique.

**Récapitulatif honnête.** La remise apparaît enfin dans le tunnel — elle était
appliquée au panier mais disparaissait au checkout.

---

## 🔧 Bugs corrigés

**Le déclencheur de statut plantait toute création de commande.** Il était en
`BEFORE INSERT` et écrivait dans `order_events` avec une clé étrangère vers une
commande qui n'existait pas encore. Violation de contrainte, insertion refusée :
**aucune commande n'aurait pu être créée**. Scindé en deux — un `BEFORE` qui
complète la ligne, un `AFTER` qui écrit l'historique.

**Deux moyens de paiement fictifs.** PayPal et virement bancaire étaient
proposés au client alors que seul Stripe est branché. Retirés. La mention de
démonstration, devenue mensongère, a laissé place à une phrase exacte sur le
traitement des données bancaires.

**Adresse obligatoire en retrait.** Le formulaire refusait de partir sans
adresse postale, même pour un client venant chercher sa commande.

**Perte de la mémoire des champs obligatoires.** La fonction qui masque l'étape
d'adresse n'était pas idempotente : appelée deux fois en mode retrait, elle
effaçait la trace des champs à rétablir. Repasser en livraison laissait alors le
formulaire sans aucun champ requis. La liste est désormais écrite noir sur
blanc plutôt que déduite de l'état courant.

**Livraison sans adresse acceptée par le serveur.** La fonction de paiement
n'exigeait pas d'adresse : une commande à livrer pouvait être encaissée sans
savoir où l'envoyer. Refusée avant tout débit.

**Clé de commande bloquée après un refus de Stripe.** Un échec laissait le jeton
en place, empêchant le client de réessayer. Il est maintenant libéré.

**Statuts absents de l'affichage admin.** « Prête au retrait » et « Retirée »
n'avaient pas d'étiquette et se seraient affichés en anglais brut.

---

## 📌 Points restant à améliorer

**Bloquants avant d'encaisser un euro réel**

- Les clés Stripe ne sont pas déposées (voir `STRIPE.md`).
- Les prix sont provisoires et vivent à deux endroits : `js/products.js` et la
  table `products`. C'est la base qui facture — corriger un seul côté ferait
  payer autre chose que le prix affiché.
- Mentions légales et CGV incomplètes. Vendre en ligne en France impose
  d'identifier l'éditeur et de mentionner la rétractation de quatorze jours.
- Les 88 variantes sont à zéro et le suivi des stocks est éteint : la boutique
  accepte des commandes sur des articles absents. À activer depuis l'écran Stocks
  une fois les quantités saisies.

**Recommandé ensuite**

- Brancher l'envoi des e-mails sur `email_outbox`.
- Renseigner les coordonnées de la boutique pour ouvrir le retrait.
- Remboursements : ils se font depuis Stripe et se répercutent automatiquement
  dans l'admin, mais l'initier demande d'ouvrir le tableau de bord Stripe.
- Facture PDF : Stripe sait le faire nativement, à activer dans ses réglages.

**Confort**

- Une relance automatique des paniers abandonnés serait possible : les commandes
  restées en `pending` sont déjà identifiables.
- Le reste de l'écran Paramètres (TVA, SEO, devise) affiche des champs qui ne
  sont pas encore enregistrés en base. Seule la carte « Boutique physique » est
  réellement branchée.

---

## Post-commande : ce qui est prêt pour la suite

Rien de marketing n'a été développé, conformément à la demande. Mais la
structure permet de l'ajouter sans rien casser :

- `order_events` donne la date exacte de livraison ou de retrait — c'est le
  déclencheur naturel d'une demande d'avis, quelques jours après.
- `email_outbox` accepte n'importe quel type de message : ajouter
  `review_request` ne demande qu'une ligne.
- `customers` accumule déjà l'historique d'achat, matière première d'un
  programme de fidélité.
- `getRelatedProducts()` existe déjà dans `js/products.js` pour des
  recommandations.

---

## Compte client

Volontairement absent. Le parcours invité est complet et le suivi par référence
couvre le besoin réel — retrouver sa commande. Un espace client avec mot de
passe ajouterait une responsabilité RGPD et une surface d'attaque sans bénéfice
immédiat. La décision reste réversible : `customers` existe déjà et pourrait
être rattachée à Supabase Auth le jour venu.

---

## Newsletter

Newsletter volontairement non implémentée — prévue pour une prochaine phase.

---

## Tests exécutés

**Base de données** — 11 vérifications sur 11 : les deux cycles de vie complets
(livraison et retrait), l'horodatage de chaque étape, la sortie de stock, les
messages préparés, l'absence de tout envoi, les libellés client.

**Fonction de suivi, en ligne** — bonne référence avec la bonne adresse : 200,
avec adresse e-mail masquée, coordonnées de la boutique et frise complète.
Bonne référence avec une autre adresse : 404, message générique.

**Étanchéité** — un visiteur anonyme lit les coordonnées de la boutique (il en a
besoin) mais ni les commandes, ni l'historique, ni la file d'e-mails, ni les
clients. Aucune écriture possible.

**Admin** — les 14 écrans se rendent sans erreur, à vide et avec des données.
Une commande en retrait ne propose pas de transporteur ; une commande en point
relais le propose ; une commande annulée ne propose aucune action.

**Site** — les 9 pages se chargent sans erreur console. Bascule livraison ↔
retrait vérifiée dans les deux sens.

**Mobile** — aucune largeur figée supérieure à 320 px dans les nouveaux écrans,
points de rupture déclarés, colonnes du tableau des commandes étiquetées pour
l'affichage en cartes.
