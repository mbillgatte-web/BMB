-- Schéma initial de Build My Business : tables créées à l'origine dans
-- l'éditeur SQL de Supabase, reconstituées ici (05/10/2026) à partir du code
-- de src/data pour permettre une installation sur un projet Supabase neuf.
--
-- À exécuter EN PREMIER, avant les autres migrations (publication, projet,
-- étude de faisabilité). Idempotent : peut être rejoué sans casser. Sur la
-- base d'origine, ne fait rien (les objets existent déjà).

-- 1. Profil d'un utilisateur (même id que auth.users).
create table if not exists public.compte (
  id uuid primary key references auth.users (id) on delete cascade,
  nom text,
  prenom text,
  contact text,
  created_at timestamptz not null default now()
);

-- 2. Entreprises d'un compte (plusieurs par compte).
create table if not exists public.entreprise (
  id uuid primary key default gen_random_uuid(),
  compte_id uuid not null references public.compte (id) on delete cascade,
  nom text not null,
  slogan text,
  secteur_activite text,
  contact text,
  adresse text,
  created_at timestamptz not null default now()
);
create index if not exists entreprise_compte_id_idx on public.entreprise (compte_id);

-- 3. Identité visuelle (une par entreprise).
create table if not exists public.identite_visuelle (
  id uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null unique references public.entreprise (id) on delete cascade,
  palette_mode text,
  couleur_primaire text,
  couleur_fond text,
  couleur_accent text,
  police_titre text,
  police_texte text,
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Sites web (un par couple entreprise + modèle ; "ia" = site généré par l'IA).
-- Les colonnes de publication (slug, est_publie, html_publie, publie_le) sont
-- ajoutées par 20260930120000_publication_site.sql.
create table if not exists public.site (
  id uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references public.entreprise (id) on delete cascade,
  template_id text not null,
  content jsonb,
  html text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists site_entreprise_id_idx on public.site (entreprise_id);

-- 5. Sécurité par lignes (RLS) : un compte ne voit que ses données.
alter table public.compte enable row level security;
alter table public.entreprise enable row level security;
alter table public.identite_visuelle enable row level security;
alter table public.site enable row level security;

drop policy if exists compte_own on public.compte;
create policy compte_own on public.compte
  for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists entreprise_own on public.entreprise;
create policy entreprise_own on public.entreprise
  for all to authenticated using (compte_id = auth.uid()) with check (compte_id = auth.uid());

drop policy if exists identite_own on public.identite_visuelle;
create policy identite_own on public.identite_visuelle
  for all to authenticated
  using (exists (select 1 from public.entreprise e where e.id = identite_visuelle.entreprise_id and e.compte_id = auth.uid()))
  with check (exists (select 1 from public.entreprise e where e.id = identite_visuelle.entreprise_id and e.compte_id = auth.uid()));

drop policy if exists site_own on public.site;
create policy site_own on public.site
  for all to authenticated
  using (exists (select 1 from public.entreprise e where e.id = site.entreprise_id and e.compte_id = auth.uid()))
  with check (exists (select 1 from public.entreprise e where e.id = site.entreprise_id and e.compte_id = auth.uid()));

-- 6. Buckets de stockage (publics en lecture : logos et images des sites).
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true), ('site-images', 'site-images', true)
on conflict (id) do nothing;

drop policy if exists "lecture publique logos" on storage.objects;
create policy "lecture publique logos" on storage.objects
  for select using (bucket_id in ('logos', 'site-images'));

drop policy if exists "ecriture logos authentifie" on storage.objects;
create policy "ecriture logos authentifie" on storage.objects
  for insert to authenticated with check (bucket_id in ('logos', 'site-images'));

drop policy if exists "maj logos authentifie" on storage.objects;
create policy "maj logos authentifie" on storage.objects
  for update to authenticated using (bucket_id in ('logos', 'site-images'));
