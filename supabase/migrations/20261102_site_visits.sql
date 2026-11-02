-- NOVRA — Mesure d'audience maison (visiteurs par jour / semaine / mois)
-- À exécuter dans Supabase > SQL Editor (projet luvydsusnupkxvjfxsug).
-- Aucune donnée personnelle : un identifiant aléatoire par navigateur, le chemin de la page, la date.

create table if not exists public.site_visits (
  id bigint generated always as identity primary key,
  visited_at timestamptz not null default now(),
  day date not null default ((now() at time zone 'Europe/Paris')::date),
  path text not null,
  visitor text not null
);
create index if not exists site_visits_day_idx on public.site_visits (day);
create index if not exists site_visits_day_visitor_idx on public.site_visits (day, visitor);
alter table public.site_visits enable row level security;
revoke all on public.site_visits from anon, authenticated;

-- Enregistrement d'une visite (seul point d'écriture ouvert au navigateur).
create or replace function public.track_visit(p_path text, p_visitor text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_visitor is null or p_visitor !~ '^[a-z0-9]{8,40}$' then return; end if;
  if p_path is null or length(p_path) > 200 then return; end if;
  insert into public.site_visits(path, visitor) values (left(p_path, 200), p_visitor);
end $$;
revoke execute on function public.track_visit(text, text) from public;
grant execute on function public.track_visit(text, text) to anon, authenticated;

-- Lecture réservée aux administrateurs.
create or replace function public.admin_visitor_stats()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  today date := (now() at time zone 'Europe/Paris')::date;
  res jsonb;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select jsonb_build_object(
    'today', (select jsonb_build_object('visitors', count(distinct visitor), 'views', count(*)) from site_visits where day = today),
    'week',  (select jsonb_build_object('visitors', count(distinct visitor), 'views', count(*)) from site_visits where day >= date_trunc('week', today::timestamp)::date),
    'month', (select jsonb_build_object('visitors', count(distinct visitor), 'views', count(*)) from site_visits where day >= date_trunc('month', today::timestamp)::date),
    'daily', coalesce((select jsonb_agg(jsonb_build_object('d', g.d::date, 'visitors', coalesce(s.v,0), 'views', coalesce(s.n,0)) order by g.d)
        from generate_series(today - 29, today, interval '1 day') as g(d)
        left join (select day, count(distinct visitor) v, count(*) n from site_visits group by day) s on s.day = g.d::date), '[]'::jsonb),
    'weekly', coalesce((select jsonb_agg(jsonb_build_object('d', g.d::date, 'visitors', coalesce(s.v,0), 'views', coalesce(s.n,0)) order by g.d)
        from generate_series(date_trunc('week', today::timestamp) - interval '11 weeks', date_trunc('week', today::timestamp), interval '1 week') as g(d)
        left join (select date_trunc('week', day::timestamp) w, count(distinct visitor) v, count(*) n from site_visits group by 1) s on s.w = g.d), '[]'::jsonb),
    'monthly', coalesce((select jsonb_agg(jsonb_build_object('d', g.d::date, 'visitors', coalesce(s.v,0), 'views', coalesce(s.n,0)) order by g.d)
        from generate_series(date_trunc('month', today::timestamp) - interval '11 months', date_trunc('month', today::timestamp), interval '1 month') as g(d)
        left join (select date_trunc('month', day::timestamp) m, count(distinct visitor) v, count(*) n from site_visits group by 1) s on s.m = g.d), '[]'::jsonb),
    'top_pages', coalesce((select jsonb_agg(t) from (select path, count(*) views, count(distinct visitor) visitors from site_visits where day >= today - 29 group by path order by views desc limit 8) t), '[]'::jsonb)
  ) into res;
  return res;
end $$;
revoke execute on function public.admin_visitor_stats() from public, anon;
grant execute on function public.admin_visitor_stats() to authenticated;

-- Conservation limitée à 25 mois (recommandation CNIL pour la mesure d'audience).
select cron.schedule('purge-site-visits', '17 3 * * *',
  $$delete from public.site_visits where day < (now() - interval '25 months')::date$$);
