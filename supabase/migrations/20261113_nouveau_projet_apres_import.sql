-- =========================================================================
-- NOVRA — À exécuter dans le NOUVEAU projet (zlqdpifvneogbtxvovjw),
-- dans l'éditeur SQL, APRÈS l'import de novra_migration_public_schema.sql.
-- Étape par étape : exécutez chaque bloc séparément.
-- =========================================================================

-- ---- BLOC 1 : extensions -------------------------------------------------
create extension if not exists pg_net  with schema extensions;
create extension if not exists pg_cron with schema pg_catalog;

-- ---- BLOC 2 : création automatique du profil admin à l'inscription -------
-- (ce déclencheur vit dans le schéma auth, absent de la sauvegarde)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_admin();

-- ---- BLOC 3 : stockage des photos ---------------------------------------
insert into storage.buckets (id, name, public)
values ('novra-media', 'novra-media', true)
on conflict (id) do update set public = true;

drop policy if exists "novra_media_read"   on storage.objects;
drop policy if exists "novra_media_insert" on storage.objects;
drop policy if exists "novra_media_update" on storage.objects;
drop policy if exists "novra_media_delete" on storage.objects;
create policy "novra_media_read"   on storage.objects for select using (bucket_id = 'novra-media');
create policy "novra_media_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'novra-media' and public.can_edit_content());
create policy "novra_media_update" on storage.objects for update to authenticated
  using (bucket_id = 'novra-media' and public.can_edit_content());
create policy "novra_media_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'novra-media' and public.can_edit_content());

-- ---- BLOC 4 : e-mails de commande ----------------------------------------
create or replace function public.trigger_send_order_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  perform net.http_post(
    url := 'https://zlqdpifvneogbtxvovjw.supabase.co/functions/v1/send-order-email',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('id', new.id)
  );
  return new;
end $$;
revoke execute on function public.trigger_send_order_email() from public, anon, authenticated;

drop trigger if exists email_outbox_send on public.email_outbox;
create trigger email_outbox_send
  after insert on public.email_outbox
  for each row execute function public.trigger_send_order_email();

-- Relance toutes les 5 minutes des messages restés en file.
select cron.unschedule('flush-email-outbox')
  where exists (select 1 from cron.job where jobname = 'flush-email-outbox');
select cron.schedule('flush-email-outbox', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://zlqdpifvneogbtxvovjw.supabase.co/functions/v1/send-order-email',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := '{}'::jsonb)
$$);

-- ---- BLOC 5 : adresses des photos (ancien projet -> nouveau projet) ------
-- À lancer seulement après avoir re-téléversé les photos dans le bucket novra-media.
do $$
declare old_u text := 'https://luvydsusnupkxvjfxsug.supabase.co';
        new_u text := 'https://zlqdpifvneogbtxvovjw.supabase.co';
begin
  update public.products set images = replace(images::text, old_u, new_u)::jsonb
   where images::text like '%' || old_u || '%';
  update public.section_media set
    desktop_url = replace(desktop_url, old_u, new_u),
    mobile_url = replace(mobile_url, old_u, new_u),
    poster_desktop_url = replace(poster_desktop_url, old_u, new_u),
    poster_mobile_url = replace(poster_mobile_url, old_u, new_u);
  update public.media_library set public_url = replace(public_url, old_u, new_u);
  update public.content_versions set snapshot = replace(snapshot::text, old_u, new_u)::jsonb;
  update public.section_drafts set payload = replace(payload::text, old_u, new_u)::jsonb;
end $$;

-- ---- BLOC 6 : mises à jour survenues après la sauvegarde du 24/09 --------
update public.store_settings set name = 'NOVRA';

-- ---- BLOC 7 : nettoyage des commandes de test (facultatif) ---------------
-- delete from public.orders where reference in ('NVR-260903-IJF0', 'NVR-260929-P703');
