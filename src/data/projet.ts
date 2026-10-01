// MODEL de la table "projet" : c'est le SEUL fichier qui écrit des requêtes
// Supabase sur cette table (voir supabase/migrations/*_projet.sql).
//
// Une ENTREPRISE mène plusieurs PROJETS (« Ouverture d'un second point de
// vente », « Lancement de la livraison »…). Un projet n'est pas une
// entreprise : il lui est rattaché par entreprise_id, et la RLS vérifie par
// jointure que cette entreprise appartient au compte connecté.
//
// Comme dans ./entreprise.ts, chaque fonction reçoit le client Supabase en
// paramètre (client du navigateur dans les composants, client créé par
// requête dans les routes API) et lève une Error en cas d'échec.
import type { SupabaseClient } from "@supabase/supabase-js";

export type StatutProjet = "idee" | "en_cours" | "termine" | "abandonne";

export interface Projet {
  id: string;
  entreprise_id: string;
  intitule: string;
  description: string | null;
  statut: StatutProjet;
  business_plan: string | null;
  etude_faisabilite: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Statuts possibles (alignés sur la contrainte `check` de la table), avec
 * leur libellé affiché. L'ordre est celui des menus et du cycle de vie.
 */
export const STATUTS_PROJET: { value: StatutProjet; label: string }[] = [
  { value: "idee", label: "Idée" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "abandonne", label: "Abandonné" },
];

/** Statuts comptés comme « actifs » sur le tableau de bord. */
export const STATUTS_ACTIFS: StatutProjet[] = ["idee", "en_cours"];

/** Libellé lisible d'un statut ("en_cours" -> "En cours"). */
export function libelleStatut(statut: StatutProjet): string {
  return STATUTS_PROJET.find((s) => s.value === statut)?.label ?? statut;
}

const COLONNES =
  "id, entreprise_id, intitule, description, statut, business_plan, etude_faisabilite, created_at, updated_at";

/** Tous les projets d'une entreprise, du plus récent au plus ancien. */
export async function listProjetsDeLEntreprise(
  supabase: SupabaseClient,
  entrepriseId: string
): Promise<Projet[]> {
  const { data, error } = await supabase
    .from("projet")
    .select(COLONNES)
    .eq("entreprise_id", entrepriseId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Un projet par son id, ou null s'il n'existe pas (ou n'est pas visible via RLS). */
export async function getProjet(supabase: SupabaseClient, id: string): Promise<Projet | null> {
  const { data, error } = await supabase
    .from("projet")
    .select(COLONNES)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export interface NouveauProjet {
  entrepriseId: string;
  intitule: string;
  description?: string | null;
  statut?: StatutProjet;
  business_plan?: string | null;
  etude_faisabilite?: string | null;
}

/**
 * Crée un projet pour une entreprise.
 *
 * Messages d'erreur fréquents :
 * - "row-level security policy" -> la policy projet_insert_own doit comparer
 *   entreprise.compte_id (via jointure) à auth.uid().
 * - "relation "public.projet" does not exist" -> la migration *_projet.sql
 *   n'a pas encore été appliquée.
 */
export async function creerProjet(supabase: SupabaseClient, input: NouveauProjet): Promise<Projet> {
  const { data, error } = await supabase
    .from("projet")
    .insert({
      entreprise_id: input.entrepriseId,
      intitule: input.intitule,
      description: input.description ?? null,
      statut: input.statut ?? "idee",
      business_plan: input.business_plan ?? null,
      etude_faisabilite: input.etude_faisabilite ?? null,
    })
    .select(COLONNES)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Champs modifiables d'un projet (tout sauf l'entreprise et les dates). */
export type ChampsProjet = Partial<
  Pick<Projet, "intitule" | "description" | "statut" | "business_plan" | "etude_faisabilite">
>;

/** Met à jour un projet (et sa date de modification). */
export async function mettreAJourProjet(
  supabase: SupabaseClient,
  id: string,
  champs: ChampsProjet
): Promise<Projet> {
  const { data, error } = await supabase
    .from("projet")
    .update({ ...champs, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select(COLONNES)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Supprime définitivement un projet. */
export async function supprimerProjet(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("projet").delete().eq("id", id);

  if (error) throw new Error(error.message);
}

/**
 * Nombre de projets « actifs » (idée ou en cours) d'une entreprise, pour le
 * compteur du tableau de bord. `head: true` : on ne rapatrie aucune ligne,
 * seulement le total.
 */
export async function compterProjetsActifs(
  supabase: SupabaseClient,
  entrepriseId: string
): Promise<number> {
  const { count, error } = await supabase
    .from("projet")
    .select("id", { count: "exact", head: true })
    .eq("entreprise_id", entrepriseId)
    .in("statut", STATUTS_ACTIFS);

  if (error) throw new Error(error.message);
  return count ?? 0;
}
