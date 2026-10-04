-- Étude de faisabilité d'un projet.
--
-- Un PROJET a au plus UNE étude de faisabilité (projet_id unique). L'étude
-- se construit en deux temps :
--   1. l'entrepreneur répond à un questionnaire par étapes (7 axes, voir
--      src/lib/questionsEtude.ts) ; ses réponses sont stockées telles
--      quelles dans `reponses`, sauvegardées à chaque changement d'étape ;
--   2. plus tard, l'IA rédige l'étude à partir de ces réponses (`document`),
--      éventuellement exportée en PDF (`pdf_url`). Ces colonnes existent
--      déjà pour ne pas avoir à migrer de nouveau, mais restent vides tant
--      que la génération n'est pas branchée.
--
-- À appliquer à la main dans l'éditeur SQL de Supabase (ou via
-- `supabase db push`), APRÈS *_projet.sql. Idempotent : peut être rejoué
-- sans casser.

-- 1. Table.
create table if not exists public.etude_faisabilite (
  id uuid primary key default gen_random_uuid(),
  -- Unique : une seule étude par projet. L'index d'unicité sert aussi aux
  -- lectures par projet, pas besoin d'un index supplémentaire.
  projet_id uuid not null unique references public.projet (id) on delete cascade,
  -- Libellés affichés dans src/data/etudeFaisabilite.ts (STATUTS), à garder
  -- alignés sur cette contrainte.
  statut text not null default 'brouillon'
    check (statut in ('brouillon', 'generee', 'erreur')),
  -- Pas de colonne « étape courante » : l'axe où reprendre le questionnaire
  -- se déduit des réponses (premier axe sans aucune clé), voir
  -- etapeDeReprise() dans src/lib/questionsEtude.ts.
  reponses jsonb not null default '{}'::jsonb,
  document jsonb,
  pdf_url text,
  genere_le timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.etude_faisabilite is
  'Étude de faisabilité d''un projet (une par projet, supprimée avec lui) : réponses au questionnaire puis document rédigé par l''IA.';
comment on column public.etude_faisabilite.statut is
  'brouillon (réponses en cours) | generee (document rédigé par l''IA) | erreur (dernière génération échouée).';
comment on column public.etude_faisabilite.reponses is
  'Objet indexé par identifiant de question (src/lib/questionsEtude.ts, ex. "financier.apport"). Valeur null = « Je ne sais pas ». Question absente = pas encore répondue.';
comment on column public.etude_faisabilite.document is
  'Étude rédigée par l''IA à partir des réponses (étape ultérieure, vide pour l''instant).';
comment on column public.etude_faisabilite.pdf_url is
  'URL du PDF exporté de l''étude (étape ultérieure).';
comment on column public.etude_faisabilite.genere_le is
  'Date de la dernière génération réussie du document.';

-- 2. Sécurité par RLS.
--
-- Même principe que `projet`, avec une jointure de plus : la table n'a ni
-- compte_id ni entreprise_id, seulement projet_id. On vérifie donc que le
-- projet de l'étude appartient à une entreprise du compte connecté
-- (etude -> projet -> entreprise, entreprise.compte_id = auth.uid()).
alter table public.etude_faisabilite enable row level security;

drop policy if exists etude_faisabilite_select_own on public.etude_faisabilite;
create policy etude_faisabilite_select_own on public.etude_faisabilite
  for select to authenticated
  using (
    exists (
      select 1
      from public.projet p
      join public.entreprise e on e.id = p.entreprise_id
      where p.id = etude_faisabilite.projet_id and e.compte_id = auth.uid()
    )
  );

drop policy if exists etude_faisabilite_insert_own on public.etude_faisabilite;
create policy etude_faisabilite_insert_own on public.etude_faisabilite
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.projet p
      join public.entreprise e on e.id = p.entreprise_id
      where p.id = etude_faisabilite.projet_id and e.compte_id = auth.uid()
    )
  );

drop policy if exists etude_faisabilite_update_own on public.etude_faisabilite;
create policy etude_faisabilite_update_own on public.etude_faisabilite
  for update to authenticated
  using (
    exists (
      select 1
      from public.projet p
      join public.entreprise e on e.id = p.entreprise_id
      where p.id = etude_faisabilite.projet_id and e.compte_id = auth.uid()
    )
  )
  -- with check : empêche de « déplacer » une étude vers le projet d'un autre
  -- compte en modifiant projet_id.
  with check (
    exists (
      select 1
      from public.projet p
      join public.entreprise e on e.id = p.entreprise_id
      where p.id = etude_faisabilite.projet_id and e.compte_id = auth.uid()
    )
  );

drop policy if exists etude_faisabilite_delete_own on public.etude_faisabilite;
create policy etude_faisabilite_delete_own on public.etude_faisabilite
  for delete to authenticated
  using (
    exists (
      select 1
      from public.projet p
      join public.entreprise e on e.id = p.entreprise_id
      where p.id = etude_faisabilite.projet_id and e.compte_id = auth.uid()
    )
  );
