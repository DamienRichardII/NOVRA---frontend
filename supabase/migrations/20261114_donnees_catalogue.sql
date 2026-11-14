-- =========================================================================
-- NOVRA — Données du catalogue et des contenus (format INSERT, sans psql)
-- À exécuter dans l'éditeur SQL du NOUVEAU projet, APRÈS la structure.
-- Source : sauvegarde du 24/09/2026. Exécutez les blocs dans l'ordre.
--
-- Choix volontaires :
--  * track_inventory = false pour tous les produits : la boutique vend sans
--    compter tant que les stocks réels ne sont pas saisis (écran Stocks).
--  * Stocks de toutes les variantes à 0 (à saisir dans l'admin).
--  * Les adresses de photos « https://luvydsusnupkxvjfxsug.supabase.co/... »
--    restent celles de l'ancien projet : elles réapparaîtront dès sa réactivation.
-- =========================================================================

-- ---- BLOC 1 : pages -------------------------------------------------------
insert into public.pages (id, page_key, label, path, sort_order) values
('30d10eb0-5396-498d-bf89-941c6bcf51dd', 'home',    'Accueil',      'index.html',       1),
('95a38800-9e60-4040-a4ab-26166a36a118', 'shop',    'Shop',         'marketplace.html', 2),
('a29bca83-805b-4549-ab1a-3ae632b50d7c', 'mission', 'Notre mission','about.html',       3),
('66e47861-f646-47e9-b17f-e5c6c139fd5a', 'contact', 'Contact',      'contact.html',     4)
on conflict (id) do nothing;

-- ---- BLOC 2 : sections de pages -------------------------------------------
insert into public.page_sections
 (id, page_id, section_key, section_type, locked, sort_order, status, eyebrow, title, subtitle, description, caption,
  cta1_label, cta1_url, cta1_blank, cta2_label, cta2_url, cta2_blank, text_position, text_align) values
('5b88fef5-38a3-4ca5-8a4b-772be59d81e5','30d10eb0-5396-498d-bf89-941c6bcf51dd','mission','editorial',false,8,'published',
  '05 — Mission', $t$Plus qu'une marque, un état d'esprit$t$, null,
  $t$Créer des équipements qui permettent à chacun de se dépasser, sans compromis sur la qualité, le confort et le style.$t$, null,
  $t$Découvrir l'histoire$t$, 'about.html', false, null, null, false, 'center', 'left'),
('1873fba3-535a-4a9a-a4f7-80aee548c1fc','30d10eb0-5396-498d-bf89-941c6bcf51dd','communaute','grid',false,11,'published',
  '08 — Communauté', 'La communauté NOVRA', null, null, null,
  'Follow the movement', 'https://www.instagram.com/novra_officiel/', false, null, null, false, 'bottom-left', 'left'),
('3952d234-8267-4326-bcbc-3594d5209f42','a29bca83-805b-4549-ab1a-3ae632b50d7c','hero','image',true,1,'published',
  null, 'Notre mission', null,
  $t$Créer des équipements qui permettent à chacun de se dépasser, sans compromis sur la qualité, le confort et le style.$t$, null,
  null, null, false, null, null, false, 'bottom-left', 'left'),
('e4d28063-797f-4922-bc97-5d13e9080628','66e47861-f646-47e9-b17f-e5c6c139fd5a','intro','editorial',false,1,'published',
  null, 'Contact', null,
  'Une question sur un produit, une commande ou une taille ? Écrivez-nous, nous répondons rapidement.', null,
  null, null, false, null, null, false, 'bottom-left', 'left'),
('e1f573a1-c1b7-4652-9b78-9386c535dde1','30d10eb0-5396-498d-bf89-941c6bcf51dd','marque','editorial',false,2,'published',
  '01 — La marque', 'Conçu pour la performance', null,
  'Chaque pièce NOVRA est pensée pour accompagner votre mouvement. Des matières techniques, un design minimaliste et une exigence absolue sur la qualité.', null,
  'Notre engagement', 'about.html', false, null, null, false, 'center', 'left'),
('91cddb91-a319-4fc5-93d1-7cb2f018a146','30d10eb0-5396-498d-bf89-941c6bcf51dd','techno','editorial',false,7,'disabled',
  '03 — Technologie', 'Technologie au service de votre performance', null, null, null,
  null, null, false, null, null, false, 'center', 'left'),
('1eb60171-8664-4918-8eee-d5c0e421bd4b','30d10eb0-5396-498d-bf89-941c6bcf51dd','hero','video',true,1,'published',
  null, null, null, null, null,
  'Shop', 'marketplace.html', false, 'Notre mission', 'about.html', false, 'bottom-left', 'left'),
('a4dfa67d-d3e3-4a6f-835d-1349b3513c07','30d10eb0-5396-498d-bf89-941c6bcf51dd','categories','grid',false,4,'published',
  'Nos essentiels', 'Par catégorie', null, null, null,
  'Tout afficher', 'marketplace.html', false, null, null, false, 'bottom-left', 'left'),
('30ece6c6-0c0a-4000-8565-c06d49ac6957','95a38800-9e60-4040-a4ab-26166a36a118','hero','slideshow',true,1,'published',
  null, 'Boutique', null,
  $t$Toute la collection NOVRA. Des pièces techniques pensées pour l'entraînement, le running et le quotidien.$t$, null,
  null, null, false, null, null, false, 'bottom-left', 'left'),
('d4fcfdc5-c316-4e20-acde-1e2222801bd6','30d10eb0-5396-498d-bf89-941c6bcf51dd','collections','grid',false,3,'published',
  '04 — Collections', 'Trouvez votre équipement', null, null, null,
  null, null, false, null, null, false, 'bottom-left', 'left')
on conflict (id) do nothing;

-- ---- BLOC 3 : médias des sections -----------------------------------------
insert into public.section_media
 (id, section_id, media_type, desktop_url, mobile_url, poster_desktop_url, poster_mobile_url, alt_text, caption,
  focal_x_desktop, focal_y_desktop, focal_x_mobile, focal_y_mobile, sort_order, active, duration_ms, transition_ms, autoplay, loop, muted) values
('3541b788-a03e-43bf-a93d-b72350a01b36','91cddb91-a319-4fc5-93d1-7cb2f018a146','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1788380428003-150864.png',null,null,null,'Deux athlètes portant les coupe-vent NOVRA',null,65,11,52,68,0,true,30000,1300,true,true,true),
('a2d10640-3d7c-4659-ab7a-09d8b6b67eec','5b88fef5-38a3-4ca5-8a4b-772be59d81e5','image','assets/web/vitrine/4o8a0158.jpg',null,null,null,'Athlète NOVRA en veste coupe-vent noire',null,50,50,50,50,0,true,30000,1300,true,true,true),
('acd54f3c-c57d-4166-9e45-84f1e108395b','3952d234-8267-4326-bcbc-3594d5209f42','image','assets/web/vitrine/4o8a0158.jpg',null,null,null,'Athlète NOVRA en veste coupe-vent noire',null,60,26,55,30,0,true,30000,1300,true,true,true),
('d082a88f-e850-4e15-842d-33a86897e75d','e1f573a1-c1b7-4652-9b78-9386c535dde1','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/08/1787267385179-155035.png',null,null,null,'Athlète NOVRA en t-shirt technique gris',null,50,50,50,50,0,true,30000,1300,true,true,true),
('dd730e97-2bc0-4183-b12e-0fd40e694854','30ece6c6-0c0a-4000-8565-c06d49ac6957','image','assets/web/boutique/boutique-sac.jpg',null,null,null,'Sac shopping NOVRA noir avec logo',null,50,55,50,55,0,true,30000,1300,true,true,true),
('a3ddbb67-2faa-4016-926a-bb367beca95a','30ece6c6-0c0a-4000-8565-c06d49ac6957','image','assets/web/boutique/boutique-tshirt-dos.jpg',null,null,null,'T-shirt NOVRA imprimé au dos, porté en tribune',null,50,42,50,40,1,true,30000,1300,true,true,true),
('9ddce6ed-b49a-4954-b7fb-9aaadcb70edf','30ece6c6-0c0a-4000-8565-c06d49ac6957','image','assets/web/boutique/boutique-colis.jpg',null,null,null,'Colis d''expédition NOVRA emballés',null,50,50,50,50,2,true,30000,1300,true,true,true),
('5ba5293b-4d7b-4e04-86fe-25af2b249170','1eb60171-8664-4918-8eee-d5c0e421bd4b','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/08/1787267805135-155036.jpg',null,'assets/web/video/novra-hero-poster.jpg','assets/web/video/novra-hero-poster.jpg','Film de marque NOVRA',null,50,50,50,32,0,true,30000,1300,true,true,true),
('3e6c8938-a8e1-44c2-9003-b83f7706b1ac','1873fba3-535a-4a9a-a4f7-80aee548c1fc','image','assets/web/communaute/communaute-veste-noir-fille.jpg',null,null,null,'Jeune fille en veste NOVRA noire à capuche',null,50,50,50,50,5,true,30000,1300,true,true,true),
('cfa595cc-41c0-4fef-af9d-c2f3f863cc62','1873fba3-535a-4a9a-a4f7-80aee548c1fc','image','assets/web/communaute/communaute-casquette-orange.jpg',null,null,null,'Casquette NOVRA orange, portée de profil',null,50,50,50,50,6,true,30000,1300,true,true,true),
('f1410f89-7c1d-4038-9f59-dcc3ef647cff','a4dfa67d-d3e3-4a6f-835d-1349b3513c07','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789500145151-176100.png',null,null,null,'T-shirts',null,50,50,50,50,0,true,30000,1300,true,true,true),
('a6a412f0-2e2f-4add-bdd1-0a80573264bb','a4dfa67d-d3e3-4a6f-835d-1349b3513c07','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789499715241-179122.jpg',null,null,null,'Polos',null,50,50,50,50,1,true,30000,1300,true,true,true),
('176c8fcb-8712-4ce7-b466-fd3678ab2c22','a4dfa67d-d3e3-4a6f-835d-1349b3513c07','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789499771191-165050.png','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789500807674-179284.jpg',null,null,'Ensembles',null,50,50,50,50,2,true,30000,1300,true,true,true),
('e2411df3-e03f-4353-b9f9-c9d2513163b7','a4dfa67d-d3e3-4a6f-835d-1349b3513c07','image','assets/web/pantalon/dsc02384.jpg',null,null,null,'Pantalons',null,50,50,50,50,3,true,30000,1300,true,true,true),
('cd152378-a327-4900-a65a-dea5dd97f0a6','a4dfa67d-d3e3-4a6f-835d-1349b3513c07','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789499960867-179174.png',null,null,null,'Vestes',null,50,50,50,50,4,true,30000,1300,true,true,true),
('934c3b61-9cb7-46b0-a565-219f99ed6f61','a4dfa67d-d3e3-4a6f-835d-1349b3513c07','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789506395665-179421.jpg',null,null,null,'Accessoires',null,50,50,50,50,5,true,30000,1300,true,true,true),
('3395bd66-cde5-4580-bfa9-cbc308f97acd','d4fcfdc5-c316-4e20-acde-1e2222801bd6','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789497298659-179283.png',null,null,null,'Collection Homme NOVRA',null,52,19,52,19,0,true,30000,1300,true,true,true),
('606ba558-9598-481f-933e-6019dfaa0526','d4fcfdc5-c316-4e20-acde-1e2222801bd6','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1788925880081-172911.png',null,null,null,'Collection Femme NOVRA',null,51,2,50,22,1,true,30000,1300,true,true,true),
('6fd1f695-bc05-4913-888e-ba1aa408b5fb','d4fcfdc5-c316-4e20-acde-1e2222801bd6','image','https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789672894364-181218.png',null,null,null,'Accessoires NOVRA',null,50,50,50,24,2,true,30000,1300,true,true,true),
('1de15537-a3b3-4142-8180-1ceb49d5d24c','1873fba3-535a-4a9a-a4f7-80aee548c1fc','image','assets/web/communaute/communaute-foot-enfant.jpg',null,null,null,'Jeune joueur en ensemble NOVRA noir, jonglant avec un ballon en ville',null,50,50,50,50,0,true,30000,1300,true,true,true),
('e801a0b3-ab3e-4fc7-bb19-162edac994b6','1873fba3-535a-4a9a-a4f7-80aee548c1fc','image','assets/web/communaute/communaute-bob-veste.jpg',null,null,null,'Bob et veste coupe-vent NOVRA noirs, portés',null,50,50,50,50,1,true,30000,1300,true,true,true),
('08623a20-65e9-43d0-af49-69bc06cb8bf1','1873fba3-535a-4a9a-a4f7-80aee548c1fc','image','assets/web/communaute/communaute-tshirt-menthe.jpg',null,null,null,'Athlète en t-shirt et short NOVRA menthe',null,50,50,50,50,2,true,30000,1300,true,true,true),
('36737327-fff6-4ec7-ab04-a9aa809810df','1873fba3-535a-4a9a-a4f7-80aee548c1fc','image','assets/web/communaute/communaute-veste-rouge.jpg',null,null,null,'Veste technique NOVRA rouge à capuche, portée avec gants',null,50,50,50,50,3,true,30000,1300,true,true,true),
('b24a93e6-0018-4b74-b603-3b4c519ed8ff','1873fba3-535a-4a9a-a4f7-80aee548c1fc','image','assets/web/communaute/communaute-tshirt-jaune.jpg',null,null,null,'T-shirt NOVRA jaune fluo, porté avec casquette',null,50,50,50,50,4,true,30000,1300,true,true,true)
on conflict (id) do nothing;

-- ---- BLOC 4 : boutique et invitations d'administrateurs -------------------
insert into public.store_settings (id, name, address, zip, city, phone, email, hours) values
(true, 'NOVRA', '26 ter rue jules princet', '93600', 'AULNAY-SOUS-BOIS', '0643873535', 'novraurban@gmail.com',
 '[{"day": "Lundi", "hours": "Fermer"}, {"day": "Mardi", "hours": "11h 18h"}, {"day": "Mercredi", "hours": "11h 18h"}, {"day": "Jeudi", "hours": "11h 18h"}, {"day": "Vendredi", "hours": "10h 12h 14h 18h"}, {"day": "Samedi", "hours": "11h 19h"}]'::jsonb)
on conflict (id) do update set name = excluded.name, address = excluded.address, zip = excluded.zip,
  city = excluded.city, phone = excluded.phone, email = excluded.email, hours = excluded.hours;

insert into public.admin_invitations (email, role, full_name) values
('damien.miyouna@gmail.com', 'super_admin', 'Damien Miyouna'),
('novraurban@gmail.com', 'manager', 'Mahamé')
on conflict (email) do nothing;

-- ---- BLOC 5 : produits ----------------------------------------------------
insert into public.products
 (id, slug, name, category, gender, price, description, details, images, colors, sizes, badge, status, featured, sort_order, track_inventory, focal_x, focal_y) values
('5941a188-babe-4e8d-9c9b-febaa806be93','ensemble-training-corail','Ensemble Training Corail','ensembles','homme',45.99,
 $t$L'ensemble Training en corail. Bande réfléchissante sur la manche, maille aérée et short assorti. Pour ceux qui s'entraînent quand les autres dorment encore.$t$,
 '["Ensemble t-shirt + short", "Bande réfléchissante manche", "Maille aérée haute ventilation", "Short avec cordon de serrage"]',
 '["assets/web/ensemble-corail/dsc02371.jpg", "assets/web/ensemble-corail/dsc02373.jpg", "assets/web/ensemble-corail/dsc02374.jpg", "assets/web/ensemble-corail/dsc02375.jpg", "assets/web/ensemble-corail/dsc02376.jpg", "assets/web/ensemble-corail/dsc02377.jpg"]',
 '["Corail"]','["XS", "S", "M", "L", "XL", "XXL"]','Nouveau','draft',false,9,false,50,50),
('29c3ea43-d7dd-45ac-810c-e4c0fa4795ea','ensemble-training-menthe','Ensemble Training Menthe','ensembles','homme',45.99,
 'T-shirt et short assortis en maille technique dégradée. Un ensemble complet, taillé pour la salle, le terrain et les séances qui comptent.',
 '["Ensemble t-shirt + short", "Maille technique dégradée", "Short avec cordon de serrage", "Séchage rapide"]',
 '["assets/web/ensemble-menthe/dsc02317.jpg", "assets/web/ensemble-menthe/dsc02319.jpg", "assets/web/ensemble-menthe/dsc02320.jpg", "assets/web/ensemble-menthe/dsc02321.jpg", "assets/web/ensemble-menthe/dsc02322.jpg", "assets/web/ensemble-menthe/dsc02323.jpg", "assets/web/ensemble-menthe/dsc02325.jpg"]',
 '["Menthe"]','["XS", "S", "M", "L", "XL", "XXL"]','Nouveau','draft',true,7,false,50,50),
('6b811341-ed43-4e7f-8982-a9f372efa1b0','polo','POLO','polos','homme',49.00,null,
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789226019016-whatsapp-image-2026-09-12-at-5.11.41-pm.jpeg"]',
 '["Noir", "Blanc", "Gris", "Beige"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'archived',false,18,false,50,50),
('b5fa8997-cf27-4651-b06e-8ceba5116051','tshirt-performance-blanc','T-shirt Performance Blanc','t-shirts','homme',39.99,
 'Version claire du T-shirt Performance. Même maille technique, même exigence, avec un logo NOVRA discret à l''épaule et une base arrondie qui accompagne le mouvement.',
 '["Maille technique à séchage rapide", "Base arrondie allongée dans le dos", "Logo NOVRA imprimé épaule", "Traitement anti-odeur"]',
 '["assets/web/tshirt-blanc/dsc02413.jpg", "assets/web/tshirt-blanc/dsc02416.jpg", "assets/web/tshirt-blanc/dsc02414.jpg", "assets/web/tshirt-blanc/dsc02418.jpg", "assets/web/tshirt-blanc/dsc02419.jpg"]',
 '["Blanc"]','["XS", "S", "M", "L", "XL", "XXL"]','Nouveau','draft',true,1,false,50,50),
('2ee67dd0-83a1-49c7-ac63-82b44de31318','bob-nylon','Bob nylon','accessoires','homme',30.00,
 'nylon  - Déperlant. Protection UV - UPF50+. Anneaux élastiqués. Cordon extérieur réglable. Tour de tête : S/M 58cm',
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789673009605-181245.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789672760309-181216.png"]',
 '["Noir"]','["S", "M"]',null,'active',false,21,false,50,50),
('201f19c9-99bb-4454-89c2-2adec12b5a51','veste-coupe-vent','Veste coupe-vent','vestes','unisexe',99.99,
 E'veste coupe-vent a capuche integree avec cordon de serrage zip central\n2 poches laterales zippees longues avec poignets elastiques systeme de ventilation.',
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789490172925-fiche-technique-veste-sport-modifiable.pptx-2-.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1788922638810-172914.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1788922642488-172915.png"]',
 '["Noir"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'active',false,11,false,50,50),
('90aa6249-f708-4ab4-8ad3-32a1c304996d','ensemble-jogging-rose','Ensemble Jogging corail','ensembles','femme',89.99,
 'Ensemble veste et pantalon en tissu léger bi-matière. Capuche, taille élastiquée et coupe fluide. Une pièce d''échauffement pensée pour être portée bien au-delà de la séance.',
 '["Ensemble veste + pantalon", "Tissu léger bi-matière", "Capuche et taille élastiquée", "Coupe fluide"]',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1788922210635-172911.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1788922220526-172912.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1788922229723-172913.png"]',
 '["Rose"]','["XS", "S", "M", "L", "XL", "XXL"]','Nouveau','active',true,10,false,50,50),
('0448da37-d020-450e-a841-ed5ed8cbce1f','pantalon-coton','Pantalon coton','pantalons','homme',35.99,null,
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789581303273-180200.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789581307167-180096.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789581313687-180095.png"]',
 '["Noir", "Blanc", "Gris"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'archived',false,23,false,50,50),
('b8e063c1-2542-4aaf-8055-b2c301630666','dagastan','DAGASTAN','t-shirts','homme',29.99,
 E'TEE SHIRT OVERSIZE COL ROND COTTON MANCHES COURTES 240 GR/M² 100% Coton\nJersey 240 Gr./m²',
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789589300197-180373.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789590061993-180399.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789590071956-180400.png"]',
 '["Noir"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'active',false,24,false,50,50),
('c20f158b-de33-4ec4-8b33-1718a78ed116','casquette','Casquette','accessoires','unisexe',29.00,
 'Casquette de sport  - Tissu léger à séchage rapide. Ventilations découpés au laser sur les côtés pour une meilleure respirabilité. Ajustable par sangle et clip. Tissu technique léger à séchage rapide. Bande de propreté ultra douce et, respirante. Ventilations découpées au laser pour plus de respirabilité. Tour de tête : 58cm. Visière en polyéthylène recyclé, un matériau résistant, léger et flexible.',
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789167550113-175914.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789167544491-175915.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789167558543-175913.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789167572521-175912.png"]',
 '["Noir", "Anthracite", "Kaki", "Orange", "Corail"]','["TU"]',null,'draft',false,16,false,50,50),
('07a85187-a246-43c2-aa09-1cfb7e07393a','veste-coupe-vent-corail','Veste Coupe-Vent Corail','vestes','unisexe',59.99,
 'Le coupe-vent NOVRA en coloris corail haute visibilité. Même construction ripstop, même capuche ajustée, une présence qui ne passe pas inaperçue sur la route.',
 '["Tissu ripstop ultra léger", "Coloris haute visibilité", "Capuche ajustable", "Poche poitrine zippée"]',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789156129381-171680.jpg"]',
 '["Corail"]','["XS", "S", "M", "L", "XL", "XXL"]','Nouveau','draft',false,6,false,50,50),
('ef940d7a-85a3-425f-942b-b6345cd58b3b','ensemble-training-anthracite','Ensemble Training Anthracite','ensembles','homme',85.00,
 'La version la plus sobre de l''ensemble Training. Maille chinée anthracite, bandes contrastées mates et poches latérales sur le short. Discret, technique, redoutable.',
 '["Ensemble t-shirt + short", "Maille chinée anthracite", "Poches latérales sur le short", "Bandes contrastées mates"]',
 '["assets/web/ensemble-anthracite/dsc02404.jpg", "assets/web/ensemble-anthracite/dsc02398.jpg", "assets/web/ensemble-anthracite/dsc02399.jpg", "assets/web/ensemble-anthracite/dsc02400.jpg", "assets/web/ensemble-anthracite/dsc02402.jpg", "assets/web/ensemble-anthracite/dsc02403.jpg"]',
 '["Anthracite"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'draft',true,8,false,50,50),
('ed10b99e-48bb-4033-a472-bd495bd26f35','banane-2','Banane','accessoires','unisexe',35.00,null,
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789147655066-175727.png"]',
 '["Noir"]','["TU"]',null,'draft',false,13,false,50,50),
('f3a28a07-e266-4a48-ae08-48c7a34c40de','banane-3','Banane','accessoires','homme',35.00,null,
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789148104552-175737.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789164504728-175904.png"]',
 '["Noir"]','["TU"]',null,'archived',false,14,false,50,50),
('97dba05d-0016-4189-9911-febc454d3e95','banane','Banane','accessoires','unisexe',35.00,null,
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789147171751-175714.png"]',
 '["Noir"]','["TU"]',null,'draft',false,12,false,50,50),
('d2065adc-85f4-47d2-b018-658c6897fa5f','banane-4','Banane','accessoires','unisexe',35.00,null,
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789489858035-fiche-technique-veste-sport-modifiable.pptx-1-.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789164605684-175906.jpg", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789164401042-175904.png"]',
 '["Noir"]','["TU"]',null,'active',false,15,false,50,50),
('34dfd568-0c33-42a4-9526-5b1e8779b8a8','tshirt-performance-noir','T-shirt Performance Noir','t-shirts','homme',39.99,
 'Le T-shirt Performance est la base du vestiaire NOVRA. Maille technique respirante, coupe droite légèrement oversize et détails réfléchissants sur la manche et le dos. Conçu pour l''entraînement comme pour le quotidien.',
 '["Maille technique à séchage rapide", "Détails réfléchissants manche et dos", "Coutures plates anti-frottement", "Coupe droite, tombé légèrement oversize"]',
 '["assets/web/tshirt-noir/dsc02335.jpg", "assets/web/tshirt-noir/dsc02436.jpg", "assets/web/tshirt-noir/dsc02339.jpg", "assets/web/tshirt-noir/dsc02341.jpg", "assets/web/tshirt-noir/dsc02342.jpg", "assets/web/tshirt-noir/dsc02439.jpg", "assets/web/tshirt-noir/dsc02441.jpg"]',
 '["Noir"]','["XS", "S", "M", "L", "XL", "XXL"]','Nouveau','draft',true,0,false,50,50),
('aa1c5403-c477-465d-8098-92e135eb7c84','bombers','BOMBERS','vestes','homme',99.00,
 'Manches droites. Sans étiquette de taille de marque, uniquement une puce de taille. Empiècement dans le cou pour impression. Accès pour personnalisation dans le dos. Doublure intérieure orange. Poche plaquée sur manche droite. Poches avant zippées.',
 '{"care": null, "composition": null, "technicalDetails": ["Tissu principal : 100% polyamide Oxford. 112 g/m². Doublure : 100% polyester Taffetas 230T. 70 g/m². Rembourrage 100% polyester. 200 g/m² (corps) et 160 g/m²"]}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789224839749-chatgpt-image-12-sept.-2026-16-48-34.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789224848838-chatgpt-image-12-sept.-2026-16-48-01.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789224858315-chatgpt-image-12-sept.-2026-16-47-29.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789224862723-chatgpt-image-12-sept.-2026-16-47-36.png"]',
 '["Noir"]','["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"]',null,'active',false,17,false,50,50),
('e8897e84-1450-4510-b2d2-5616646aec45','legging','Legging','pantalons','femme',39.99,
 'Legging femme  - Extensible dans les quatre sens pour un maximum de mouvement. Cordon réglable à la taille. Poche arrière zippée. Protection UV UPF 30+. Coupe ajustée et, ergonomique. Tissu absorbant et à séchage rapide. Deux poches latérales (dont une pour téléphone). Poche arrière zippée.',
 '{"care": null, "composition": null, "technicalDetails": ["80% polyester recyclé/20% élasthanne."]}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789554328461-chatgpt-image-16-sept.-2026-12-22-30.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789554337861-chatgpt-image-16-sept.-2026-12-23-15.png"]',
 '["Noir"]','["S", "M", "L"]',null,'active',false,22,false,50,50),
('5d2f0dad-7e2a-4401-ac9c-d507ae2803e1','pantalon-tech','Pantalon Tech','pantalons','homme',45.99,
 'Pantalon technique à coupe fuselée. Tissu extensible déperlant, poches zippées et bas ajustable. Il passe de l''échauffement à la ville sans changer de registre.',
 '["Tissu extensible 4 directions", "Traitement déperlant", "Poches latérales zippées", "Bas de jambe ajustable"]',
 '["assets/web/pantalon/dsc02385.jpg"]',
 '["Noir", "Kaki", "Anthracite"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'draft',true,4,false,50,50),
('39dfcca2-ef43-4fec-9a9f-cddba31b64e8','veste-coupe-vent-noire','Boetto','vestes','homme',59.99,
 'Coupe-vent technique à capuche ajustée. Tissu ripstop ultra léger, protection contre le vent et la pluie fine, empiècements ventilés dans le dos. La pièce qui supprime les excuses.',
 '["Tissu ripstop ultra léger", "Déperlant, coupe-vent", "Capuche ajustable", "Empiècements ventilés dos", "Détails réfléchissants"]',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789494144640-179158.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789495648077-179187.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789495565065-179174.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789495755130-179188.png"]',
 '["Noir"]','["XS", "S", "M", "L", "XL", "XXL"]','Nouveau','active',true,5,false,50,50),
('6400dd12-99c7-49f6-a7b4-f98af0dd660b','test','test','t-shirts','homme',2.00,null,
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789455974678-whatsapp-image-2026-09-15-at-09.04.54.jpeg"]',
 '["Noir"]','["TU"]',null,'archived',false,19,false,50,51),
('80ea6fd2-a877-4df8-8427-228bc793a02d','casquette-performance','Casquette Performance','accessoires','unisexe',30.00,
 'Casquette running ultra légère à panneaux mesh. Bandeau intérieur absorbant, visière souple et fermeture arrière réglable. Quatre coloris, une seule exigence.',
 '["Panneaux mesh haute ventilation", "Bandeau intérieur absorbant", "Visière souple pliable", "Fermeture arrière réglable"]',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789482385228-chatgpt-image-15-sept.-2026-16-25-54.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789477549362-6.jpg", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789483379709-chatgpt-image-15-sept.-2026-13-37-20.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789481523042-8.jpg", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789483704326-chatgpt-image-15-sept.-2026-16-47-31.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789481538202-7.jpg", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789483749393-chatgpt-image-15-sept.-2026-13-37-47.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789481529075-9.jpg", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789483392674-chatgpt-image-15-sept.-2026-13-37-37.png"]',
 '["Noir", "Gris", "Kaki", "Orange"]','["TU"]',null,'active',true,3,false,50,50),
('9dbd4ff8-9b33-4967-b4d8-c425fdc20b9d','relax-pants','RELAX PANTS','t-shirts','unisexe',35.99,
 E'PANTALON DE JOGGING MOLLETON Coupe Large\n300 GSM 50% Coton 50% Polyester',
 '{"care": null, "composition": "300 GSM 50% Coton 50% Polyester", "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789590607071-180200.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789590611519-180096.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789590618406-180095.png"]',
 '["Noir", "Gris"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'archived',false,25,false,50,50),
('f759dc1a-4f1b-477a-b1fa-e6a08476055d','polo-tech','BIDARIE','polos','unisexe',45.99,
 'Un polo pensé pour la performance et porté partout. Maille jacquard légère, col structuré qui ne se déforme pas et signature NOVRA brodée sur la poitrine. Disponible en trois coloris.',
 '["Maille jacquard légère et respirante", "Col structuré tenue durable", "Signature NOVRA poitrine", "Coupe régulière unisexe"]',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789490768917-whatsapp-image-2026-09-15-at-6.43.10-pm.jpeg", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789479493946-2.jpg", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789475319139-3.jpg", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789475327906-4.jpg"]',
 '["Blanc", "Beige", "Noir"]','["XS", "S", "M", "L", "XL", "XXL"]','Nouveau','active',true,2,false,50,50),
('877f5ee8-ae81-475e-88b2-af054e6df111','relax-pants-2','RELAX PANTS','pantalons','unisexe',35.99,
 E'PANTALON DE JOGGING MOLLETON Coupe Large\n300 GSM 50% Coton 50% Polyester\nLogo NOVRA en silicone 3D embossé',
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789590761554-180200.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789590765673-180096.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789590772254-180095.png"]',
 '["Noir", "Gris"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'active',false,26,false,50,50),
('b8815dfa-b65c-4b79-a80e-eee6a9218b2c','core-hoodies-black','CORE HOODIES BLACK','vestes','homme',49.99,
 'SWEAT SHIRT A CAPUCHE, 100% coton, 450 GR/M2, AVEC POCHES',
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789593434180-180489.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789593445605-180487.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789593439934-180488.png"]',
 '["Noir"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'active',false,27,false,50,50),
('bbb5b153-94ba-4d7c-bae9-7b7253148f29','tee-shirt-technoque','Tee-shirt technoque','t-shirts','homme',35.99,null,
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789621726886-180634.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789621728609-176099.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789621729785-176098.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789621731719-176100.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789621734851-176102.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789621733259-176101.png"]',
 '["Noir", "Beige"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'active',false,28,false,50,50),
('b9315e04-a6f7-409c-ae96-b956e578eb3a','novra','NOVRA','ensembles','unisexe',110.00,
 'Parfaite au quotidien, cette veste en polyester résistant présente une coupe décontractée sur toute la longueur.',
 '{"care": null, "composition": null, "technicalDetails": []}',
 '["https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789485313366-mannequin-survettement-reflechissant.png", "https://luvydsusnupkxvjfxsug.supabase.co/storage/v1/object/public/novra-media/campaigns/2026/09/1789485318861-dos.png"]',
 '["Noir"]','["XS", "S", "M", "L", "XL", "XXL"]',null,'active',false,20,false,50,50)
on conflict (id) do nothing;

-- ---- BLOC 6 : variantes (une par couleur x taille, stock à 0) ------------
insert into public.product_variants (product_id, sku, color, size, stock, low_stock_at)
select p.id, p.slug || '-' || lower(c) || '-' || lower(s), c, s, 0, 5
from public.products p
cross join lateral jsonb_array_elements_text(p.colors) c
cross join lateral jsonb_array_elements_text(p.sizes) s
on conflict do nothing;

-- ---- BLOC 7 : vérification (doit afficher 29 produits, 213 variantes, 10 sections, 24 médias) ------
select (select count(*) from public.products) as produits,
       (select count(*) from public.product_variants) as variantes,
       (select count(*) from public.page_sections) as sections,
       (select count(*) from public.section_media) as medias;
