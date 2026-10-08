// MODEL de la table "etude_faisabilite" : c'est le SEUL fichier qui écrit
// des requêtes Supabase sur cette table (voir
// supabase/migrations/*_etude_faisabilite.sql).
//
// Un PROJET a au plus UNE étude (projet_id unique). Pour l'instant on ne
// stocke que les réponses au questionnaire (src/lib/questionsEtude.ts) ;
// l'axe où reprendre se déduit des réponses (etapeDeReprise). Le document
// rédigé par l'IA et le PDF viendront dans une étape ultérieure.
//
// Comme dans ./projet.ts, chaque fonction reçoit le client Supabase en
// paramètre et lève une Error en cas d'échec. La RLS vérifie par double
// jointure (étude -> projet -> entreprise) que le projet appartient au
// compte connecté.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReponsesEtude } from "@/lib/questionsEtude";

export type StatutEtude = "brouillon" | "generee" | "erreur";

export interface EtudeFaisabilite {
  id: string;
  projet_id: string;
  statut: StatutEtude;
  reponses: ReponsesEtude;
  /** Étude rédigée par l'IA (forme à définir à l'étape suivante). */
  document: unknown | null;
  pdf_url: string | null;
  genere_le: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Statuts possibles (alignés sur la contrainte `check` de la table), avec
 * leur libellé affiché.
 */
export const STATUTS: { value: StatutEtude; label: string }[] = [
  { value: "brouillon", label: "Brouillon" },
  { value: "generee", label: "Générée" },
  { value: "erreur", label: "Erreur de génération" },
];

const COLONNES =
  "id, projet_id, statut, reponses, document, pdf_url, genere_le, created_at, updated_at";

/**
 * L'étude d'un projet, ou null s'il n'y en a pas encore (ou si le projet
 * n'est pas visible via RLS).
 *
 * Message d'erreur fréquent : "relation "public.etude_faisabilite" does not
 * exist" -> la migration *_etude_faisabilite.sql n'a pas encore été appliquée.
 */
export async function getEtudeDuProjet(
  supabase: SupabaseClient,
  projetId: string
): Promise<EtudeFaisabilite | null> {
  const { data, error } = await supabase
    .from("etude_faisabilite")
    .select(COLONNES)
    .eq("projet_id", projetId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Enregistre les réponses d'un projet. Crée la ligne au
 * premier appel, la met à jour ensuite (upsert sur projet_id, qui est
 * unique). Les réponses REMPLACENT les précédentes : le formulaire envoie
 * toujours l'objet complet, pas seulement l'axe modifié.
 */
export async function enregistrerReponses(
  supabase: SupabaseClient,
  projetId: string,
  reponses: ReponsesEtude
): Promise<EtudeFaisabilite> {
  const { data, error } = await supabase
    .from("etude_faisabilite")
    .upsert(
      {
        projet_id: projetId,
        reponses,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "projet_id" }
    )
    .select(COLONNES)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Ce que la carte d'un projet affiche sur son étude (voir ProjetCard.tsx). */
export type ResumeEtude = Pick<EtudeFaisabilite, "projet_id" | "statut" | "reponses">;

/**
 * Résumé des études de plusieurs projets en UNE requête (la liste des
 * projets n'en fait pas une par carte). Renvoie un objet indexé par
 * projet_id ; un projet absent n'a pas d'étude.
 */
export async function listResumesEtudes(
  supabase: SupabaseClient,
  projetIds: string[]
): Promise<Record<string, ResumeEtude>> {
  if (projetIds.length === 0) return {};
  const { data, error } = await supabase
    .from("etude_faisabilite")
    .select("projet_id, statut, reponses")
    .in("projet_id", projetIds);

  if (error) throw new Error(error.message);
  return Object.fromEntries(((data ?? []) as ResumeEtude[]).map((r) => [r.projet_id, r]));
}
