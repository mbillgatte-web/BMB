-- Projets d'une entreprise.
--
-- Une ENTREPRISE mène plusieurs PROJETS (ex. « Ouverture d'un second point
-- de vente », « Lancement de la livraison »). Un projet n'est pas une
-- entreprise : c'est une initiative rattachée à l'une d'elles, avec son
-- intitulé, sa description et son statut. Son étude de faisabilité vit dans
-- une table à part (voir *_etude_faisabilite.sql) : une ligne par projet,
-- avec les réponses de l'entrepreneur puis le document rédigé par l'IA.
--
-- À appliquer à la main dans l'éditeur SQL de Supabase (ou via
-- `supabase db push`). Idempotent : peut être rejoué sans casser.

-- 1. Table.
create table if not exists public.projet (
  id uuid primary key default gen_random_uuid(),
  entreprise_id uuid not null references public.entreprise (id) on delete cascade,
  intitule text not null,
  description text,
  -- Cycle de vie simple ; les libellés affichés sont dans src/data/projet.ts
  -- (STATUTS_PROJET) et doivent rester alignés sur cette contrainte.
  statut text not null default 'idee'
    check (statut in ('idee', 'en_cours', 'termine', 'abandonne')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.projet is
  'Projets menés par une entreprise (plusieurs par entreprise). Supprimés avec elle.';
comment on column public.projet.statut is
  'idee | en_cours | termine | abandonne. « Actif » = idee ou en_cours (compteur du tableau de bord).';

-- 2. Index : toutes les lectures de l'application filtrent par entreprise.
create index if not exists projet_entreprise_id_idx on public.projet (entreprise_id);

-- 3. Sécurité par RLS.
--
-- Même schéma que `site` et `identite_visuelle` : la table n'a pas de
-- compte_id, seulement entreprise_id ; on vérifie donc, par jointure, que
-- l'entreprise du projet appartient bien au compte connecté
-- (entreprise.compte_id = auth.uid()). Un compte ne voit et ne modifie que
-- les projets de SES entreprises.
alter table public.projet enable row level security;

drop policy if exists projet_select_own on public.projet;
create policy projet_select_own on public.projet
  for select to authenticated
  using (
    exists (
      select 1 from public.entreprise e
      where e.id = projet.entreprise_id and e.compte_id = auth.uid()
    )
  );

drop policy if exists projet_insert_own on public.projet;
create policy projet_insert_own on public.projet
  for insert to authenticated
  with check (
    exists (
      select 1 from public.entreprise e
      where e.id = projet.entreprise_id and e.compte_id = auth.uid()
    )
  );

drop policy if exists projet_update_own on public.projet;
create policy projet_update_own on public.projet
  for update to authenticated
  using (
    exists (
      select 1 from public.entreprise e
      where e.id = projet.entreprise_id and e.compte_id = auth.uid()
    )
  )
  -- with check : empêche de « déplacer » un projet vers l'entreprise d'un
  -- autre compte en modifiant entreprise_id.
  with check (
    exists (
      select 1 from public.entreprise e
      where e.id = projet.entreprise_id and e.compte_id = auth.uid()
    )
  );

drop policy if exists projet_delete_own on public.projet;
create policy projet_delete_own on public.projet
  for delete to authenticated
  using (
    exists (
      select 1 from public.entreprise e
      where e.id = projet.entreprise_id and e.compte_id = auth.uid()
    )
  );
