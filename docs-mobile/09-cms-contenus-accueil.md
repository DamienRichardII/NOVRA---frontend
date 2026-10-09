# 09 — CMS, contenus et accueil

## Principe ✅ (`js/cms.js`)

Le HTML statique est la **source de repli** ; la base peut le surcharger section par section. Si Supabase est injoignable, lent ou vide, **rien ne disparaît**. L'app applique la même règle : un accueil embarqué (hero, sélection, valeurs) s'affiche d'abord, puis les contenus publiés le remplacent.

Pages CMS : `home`, `shop`, `mission` (page À propos), `contact`.

## Requête (PostgREST, lecture publique du contenu publié)

```
GET /rest/v1/pages?page_key=eq.home&select=page_key,page_sections(
  section_key,section_type,status,sort_order,eyebrow,title,subtitle,description,caption,
  cta1_label,cta1_url,cta1_blank,cta2_label,cta2_url,cta2_blank,text_position,text_align,
  section_media(media_type,desktop_url,mobile_url,poster_desktop_url,poster_mobile_url,
  alt_text,caption,focal_x_desktop,focal_y_desktop,focal_x_mobile,focal_y_mobile,
  sort_order,active,duration_ms,transition_ms))
```

Garde-fous à reprendre :

- Ne garder que les sections publiées (`status`) et médias `active`, triés par `sort_order`.
- Sur mobile : `mobile_url` si présent, sinon `desktop_url` ; poster mobile idem ; **focal mobile** (`focal_*_mobile`) en `contentPosition`.
- Point focal invalide → **50 %** (jamais `NaN`) ✅ (`cmsSafeFocal`).
- Les `cta*_url` peuvent être relatifs (`marketplace.html`, `product.html?slug=…`) : les **traduire en routes internes** (`/boutique`, `/produit/[slug]`) ; `cta*_blank` vrai ou URL externe → navigateur intégré.
- Cache 60 s.

## Accueil mobile

Structure actuelle de l'accueil web ✅ (après les retraits demandés par le chef de projet), adaptée au mobile :

1. **Hero** plein écran : vidéo MP4 H.264 720p + poster (`assets/web/`), muette en boucle, `expo-video`, poster pendant le chargement. Pas de CTA dans le hero (retiré à sa demande). Désactiver la vidéo si « économie de données » / réduction d'animations.
2. **Marque** : accroche « RUN MUST GO ON ».
3. **Bande défilante** (`Marquee`) à la place de l'ancienne section Technologie.
4. **Collections / « Nos essentiels »** : tuiles par catégorie, sans entête de section ; la case « Vestes » s'appelle **« Vestes & Hoodie »**. Les tuiles peuvent être masquées/restaurées depuis l'admin.
5. **Communauté** : uniquement le carrousel photo (7 photos).
6. Pas de newsletter dans l'accueil : elle a une **page dédiée** liée depuis le pied de page. Sections supprimées et à ne pas recréer : Sélection, ADN, Univers NOVRA, Valeurs, Chiffres, CTA « Découvrir la boutique ».

Les sections se pilotent depuis l'admin (Médias & Contenus) : l'app ne doit donc rien supposer de leur nombre ; elle rend celles qu'elle reçoit et sait ignorer un `section_type` inconnu.

⚠ Les textes éditoriaux proviennent du chef de projet. Ne pas les réécrire dans l'app ; ne pas réintroduire de promesses environnementales (« greenwashing » retiré de la page Mission à la demande du client).

## Page Mission / À propos

Reprendre les textes de `about.html` ✅ : « Une marque née de l'exigence », ADN (Performance, Discipline, Style), Engagement (tests en conditions réelles, collection courte), accroche finale « Chaque jour. Chaque rep. Chaque pas. ». Les sections Technologies et Communauté sont **supprimées** à la demande du chef de projet ✅.

## Contact et newsletter ⚠

Les formulaires du site **n'enregistrent rien** aujourd'hui. Avant de les exposer dans l'app : créer une fonction Edge `contact` (stockage + e-mail via Resend) et `newsletter` (double consentement). D'ici là, l'app propose uniquement : e-mail `Novraurban@gmail.com`, Instagram `novra_officiel`, ouverture via `Linking`.

## Pages légales

CGV, politique de confidentialité, mentions légales : **WebView / navigateur intégré** vers les pages du site pour éviter deux sources. Mentions légales incomplètes (capital, SIRET/RCS/TVA après Kbis) — suivre le site, pas l'app.

## Rédaction côté admin

Les contenus se modifient dans l'admin web (brouillons `section_drafts`, publication `publish_section()`, versions `content_versions`, restauration `restore_version()`) ✅. L'app **lit seulement** le publié ; l'édition de contenu reste web en V1 (voir 10).
