-- =========================================================================
-- NOVRA — Pointer les photos vers les dossiers du site (assets/08 et assets/09)
-- À exécuter dans le NOUVEAU projet, APRÈS 20261114_donnees_catalogue.sql,
-- et APRÈS avoir poussé les dossiers assets/08 et assets/09 sur le site.
--
-- Avantage : plus besoin du stockage Supabase pour les photos existantes.
-- Les nouvelles photos ajoutées depuis l'admin utiliseront le bucket novra-media.
-- =========================================================================

-- Fonctionne quel que soit le projet Supabase cité dans l'adresse (ancien ou nouveau).
do $$
declare
  pat text := 'https://[a-z0-9]+\.supabase\.co/storage/v1/object/public/novra-media/campaigns/2026/(08|09)/';
begin
  -- Produits (liste d'images)
  update public.products
     set images = regexp_replace(images::text, pat, 'assets/\1/', 'g')::jsonb
   where images::text like '%supabase.co/storage%';

  -- Médias des sections (accueil, boutique)
  update public.section_media set
    desktop_url        = regexp_replace(desktop_url,        pat, 'assets/\1/', 'g'),
    mobile_url         = regexp_replace(mobile_url,         pat, 'assets/\1/', 'g'),
    poster_desktop_url = regexp_replace(poster_desktop_url, pat, 'assets/\1/', 'g'),
    poster_mobile_url  = regexp_replace(poster_mobile_url,  pat, 'assets/\1/', 'g');
end $$;

-- Vérification : doit renvoyer 0 pour chaque ligne (plus aucune adresse supabase.co)
select 'products' as table_name, count(*) from public.products where images::text like '%supabase.co/storage%'
union all
select 'section_media', count(*) from public.section_media
 where desktop_url like '%supabase.co/storage%' or mobile_url like '%supabase.co/storage%'
    or poster_desktop_url like '%supabase.co/storage%' or poster_mobile_url like '%supabase.co/storage%';
