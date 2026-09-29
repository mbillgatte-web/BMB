// MODEL de la table "entreprise" : c'est le SEUL fichier qui écrit des
// requêtes Supabase sur cette table. Pages, routes API, hooks et composants
// passent par les fonctions ci-dessous.
//
// Chaque fonction reçoit le client Supabase en paramètre, car il n'est pas le
// même selon l'endroit d'où on l'appelle :
//   - navigateur (hooks)  -> `supabase` de @/lib/supabase/browser
//   - serveur (routes API) -> createServerSupabase() de @/lib/supabase/server
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Entreprise {
  id: string;
  nom: string;
  slogan: string | null;
  secteur_activite: string | null;
  contact: string | null;
  adresse: string | null;
}

export interface NouvelleEntreprise {
  nom: string;
  slogan: string | null;
  contact: string | null;
  adresse: string | null;
  secteurActivite: string | null;
  compteId: string;
}

/** Valeurs possibles de la colonne secteur_activite, avec leur libellé affiché. */
export const SECTEURS = [
  { value: "commerce", label: "Commerce & vente" },
  { value: "technologie", label: "Technologie & Numérique" },
  { value: "education", label: "Éducation & Formation" },
  { value: "Restaurant", label: "Restaurant et Consomation" },
  { value: "Beauté", label: "Beauté cosmetique" },
  { value: "autre", label: "Autre" },
];

/** Libellé lisible d'un secteur ("commerce" -> "Commerce & vente"), ou null. */
export function libelleSecteur(value: string | null): string | null {
  if (!value) return null;
  return SECTEURS.find((s) => s.value === value)?.label ?? value;
}

const COLONNES = "id, nom, slogan, secteur_activite, contact, adresse";

/** Toutes les entreprises d'un compte, de la plus récente à la plus ancienne. */
export async function listEntreprisesDuCompte(
  supabase: SupabaseClient,
  compteId: string
): Promise<Entreprise[]> {
  const { data, error } = await supabase
    .from("entreprise")
    .select(COLONNES)
    .eq("compte_id", compteId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Une entreprise par son id, ou null si elle n'existe pas (ou n'est pas visible via RLS). */
export async function getEntreprise(
  supabase: SupabaseClient,
  id: string
): Promise<Entreprise | null> {
  const { data, error } = await supabase
    .from("entreprise")
    .select(COLONNES)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Crée une NOUVELLE entreprise (un compte peut en posséder plusieurs : pas
 * d'upsert sur compte_id). La policy RLS exige auth.uid() = compte_id, donc
 * le client doit être celui de l'utilisateur connecté.
 */
export async function creerEntreprise(
  supabase: SupabaseClient,
  input: NouvelleEntreprise
): Promise<Entreprise> {
  const { data, error } = await supabase
    .from("entreprise")
    .insert({
      nom: input.nom,
      slogan: input.slogan,
      contact: input.contact,
      adresse: input.adresse,
      secteur_activite: input.secteurActivite,
      compte_id: input.compteId,
    })
    .select(COLONNES)
    .single();

  if (error) throw new Error(error.message);
  return data;
}
