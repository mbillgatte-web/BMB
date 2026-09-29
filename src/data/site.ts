// MODEL de la table "site" et du bucket de stockage "site-images" : c'est le
// SEUL fichier qui écrit des requêtes Supabase pour eux.
//
// Comme dans ./entreprise.ts, chaque fonction reçoit le client Supabase en
// paramètre (client du navigateur dans les composants, client créé par
// requête dans les routes API).
//
// Une entreprise peut avoir plusieurs sites, mais un seul par template : le
// couple (entreprise_id, template_id) identifie un site. Aucune contrainte
// unique n'existe en BD sur ce couple, d'où getSite() + creerSite() plutôt
// qu'un upsert.
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Site {
  id: string;
  entreprise_id: string;
  template_id: string;
  content: Record<string, unknown> | null;
  /** HTML complet déjà personnalisé (voir buildInitialSite.ts et /api/edit-site). */
  html: string | null;
}

const COLONNES = "id, entreprise_id, template_id, content, html";

/** Le site d'une entreprise pour un template donné, ou null s'il n'a jamais été choisi. */
export async function getSite(
  supabase: SupabaseClient,
  entrepriseId: string,
  templateId: string
): Promise<Site | null> {
  const { data, error } = await supabase
    .from("site")
    .select(COLONNES)
    .eq("entreprise_id", entrepriseId)
    .eq("template_id", templateId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Crée le site d'une entreprise pour un template.
 *
 * Messages d'erreur fréquents :
 * - "row-level security policy" -> la policy site_insert_own doit comparer
 *   entreprise.compte_id (via jointure) à auth.uid().
 * - "column site.html does not exist" -> la colonne html n'a pas encore été
 *   ajoutée côté BD.
 */
export async function creerSite(
  supabase: SupabaseClient,
  input: {
    entrepriseId: string;
    templateId: string;
    content: Record<string, unknown>;
    html: string;
  }
): Promise<Site> {
  const { data, error } = await supabase
    .from("site")
    .insert({
      entreprise_id: input.entrepriseId,
      template_id: input.templateId,
      content: input.content,
      html: input.html,
    })
    .select(COLONNES)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Met à jour le contenu et/ou le HTML d'un site existant (et sa date de modification). */
export async function mettreAJourSite(
  supabase: SupabaseClient,
  siteId: string,
  champs: { content?: Record<string, unknown>; html?: string }
): Promise<Site> {
  const { data, error } = await supabase
    .from("site")
    .update({ ...champs, updated_at: new Date().toISOString() })
    .eq("id", siteId)
    .select(COLONNES)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Envoie une image épinglée par l'utilisateur dans le bucket "site-images" et
 * renvoie son URL publique. Nom unique par fichier (contrairement au logo) :
 * une entreprise peut épingler plusieurs photos au fil de ses éditions IA.
 */
export async function uploaderImageSite(
  supabase: SupabaseClient,
  entrepriseId: string,
  fichier: File
): Promise<string> {
  const extension = fichier.name.split(".").pop() ?? "jpg";
  const path = `${entrepriseId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("site-images").upload(path, fichier);

  if (error) throw new Error(error.message);
  return supabase.storage.from("site-images").getPublicUrl(path).data.publicUrl;
}
