-- Publication des sites (palier 1) : un site peut être rendu public à
-- l'adresse /s/<slug> (puis <slug>.<domaine> quand le domaine sera acheté).
--
-- Principe : on ne sert JAMAIS la colonne `html` (brouillon en cours
-- d'édition IA) au public, mais une copie figée `html_publie`, prise au
-- moment où l'entrepreneur clique « Publier ». Il peut continuer à modifier
-- son site sans que les visiteurs voient un état intermédiaire.
--
-- À appliquer à la main dans l'éditeur SQL de Supabase (ou via
-- `supabase db push`). Idempotent : peut être rejoué sans casser.

-- 1. Colonnes de publication sur la table `site`.
alter table public.site
  add column if not exists slug text unique,
  add column if not exists est_publie boolean not null default false,
  add column if not exists html_publie text,
  add column if not exists publie_le timestamptz;

comment on column public.site.slug is
  'Identifiant public du site dans l''URL (/s/<slug>). Unique sur toute la plateforme, conservé après dépublication.';
comment on column public.site.est_publie is
  'true = la page /s/<slug> répond avec html_publie ; false = 404 public.';
comment on column public.site.html_publie is
  'Copie figée du HTML au moment de la publication (la colonne html reste le brouillon).';
comment on column public.site.publie_le is
  'Date de la dernière publication (ou republication).';

-- 2. Index sur le slug : c'est la clé de recherche de chaque visite publique.
-- (La contrainte `unique` crée déjà un index ; celui-ci le rend explicite et
-- ne coûte rien s'il existe déjà.)
create index if not exists site_slug_idx on public.site (slug);

-- 3. Lecture publique SANS ouvrir la table.
--
-- Les policies RLS de `site` restent inchangées (chaque compte ne voit que
-- ses propres sites). Le public passe par cette fonction `security definer`
-- (elle s'exécute avec les droits de son propriétaire, donc contourne la
-- RLS), qui ne renvoie QUE les deux colonnes nécessaires, et seulement si le
-- site est publié. Impossible depuis l'extérieur de lister les sites, de
-- lire un brouillon ou de deviner l'entreprise derrière un slug.
create or replace function public.site_publie(p_slug text)
returns table (html_publie text, publie_le timestamptz)
language sql
stable
security definer
-- search_path figé : recommandation Supabase pour toute fonction
-- security definer (évite qu'un schéma malveillant soit résolu à la place
-- de public).
set search_path = public
as $$
  select s.html_publie, s.publie_le
  from public.site s
  where s.slug = p_slug
    and s.est_publie = true
    and s.html_publie is not null
  limit 1;
$$;

-- Par défaut, Postgres accorde `execute` à `public` sur toute nouvelle
-- fonction : on le retire pour n'autoriser explicitement que les deux rôles
-- utilisés par l'application (visiteur anonyme et utilisateur connecté).
revoke execute on function public.site_publie(text) from public;
grant execute on function public.site_publie(text) to anon, authenticated;

comment on function public.site_publie(text) is
  'Renvoie le HTML figé d''un site publié, par son slug. Point d''entrée public de /s/<slug> ; ne révèle rien si le site n''est pas publié.';
