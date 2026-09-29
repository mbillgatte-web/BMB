// MODEL de la table "identite_visuelle" et du bucket de stockage "logos" :
// c'est le SEUL fichier qui écrit des requêtes Supabase pour eux.
//
// Comme dans ./entreprise.ts, chaque fonction reçoit le client Supabase en
// paramètre (client du navigateur dans les hooks/composants, client créé par
// requête dans les routes API).
import type { SupabaseClient } from "@supabase/supabase-js";

export interface IdentiteVisuelle {
  id: string;
  entreprise_id: string;
  palette_mode: string | null;
  couleur_primaire: string | null;
  couleur_fond: string | null;
  couleur_accent: string | null;
  police_titre: string | null;
  police_texte: string | null;
  logo_url: string | null;
}

export interface NouvelleIdentiteVisuelle {
  entrepriseId: string;
  paletteMode: string | null;
  couleurPrimaire: string | null;
  couleurFond: string | null;
  couleurAccent: string | null;
  policeTitre: string | null;
  policeTexte: string | null;
  logoUrl: string | null;
}

const COLONNES =
  "id, entreprise_id, palette_mode, couleur_primaire, couleur_fond, couleur_accent, police_titre, police_texte, logo_url";

/**
 * L'identité visuelle d'une entreprise, ou null si rien n'a encore été
 * enregistré (état normal lors de la première configuration).
 */
export async function getIdentiteVisuelle(
  supabase: SupabaseClient,
  entrepriseId: string
): Promise<IdentiteVisuelle | null> {
  const { data, error } = await supabase
    .from("identite_visuelle")
    .select(COLONNES)
    .eq("entreprise_id", entrepriseId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Crée OU met à jour l'identité visuelle d'une entreprise (upsert) : une
 * entreprise n'en a qu'une seule. Nécessite la contrainte "unique" sur
 * entreprise_id côté BD pour que onConflict sache quelle ligne cibler.
 *
 * Messages d'erreur fréquents :
 * - "row-level security policy" -> la policy doit vérifier entreprise.compte_id
 *   (via une jointure) : cette table n'a pas de compte_id, seulement entreprise_id.
 * - "no unique or exclusion constraint matching ON CONFLICT" -> la contrainte
 *   unique sur entreprise_id n'existe pas encore côté BD.
 */
export async function enregistrerIdentiteVisuelle(
  supabase: SupabaseClient,
  input: NouvelleIdentiteVisuelle
): Promise<IdentiteVisuelle> {
  const { data, error } = await supabase
    .from("identite_visuelle")
    .upsert(
      {
        entreprise_id: input.entrepriseId,
        palette_mode: input.paletteMode,
        couleur_primaire: input.couleurPrimaire,
        couleur_fond: input.couleurFond,
        couleur_accent: input.couleurAccent,
        police_titre: input.policeTitre,
        police_texte: input.policeTexte,
        logo_url: input.logoUrl,
      },
      { onConflict: "entreprise_id" }
    )
    .select(COLONNES)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Envoie le fichier du logo dans le bucket "logos" (un dossier par
 * entreprise, pour éviter les collisions de noms) et renvoie son URL publique.
 * Remplace le logo précédent de l'entreprise s'il existe.
 */
export async function uploaderLogo(
  supabase: SupabaseClient,
  entrepriseId: string,
  fichier: File
): Promise<string> {
  const extension = fichier.name.split(".").pop() ?? "png";
  const path = `${entrepriseId}/logo.${extension}`;

  const { error } = await supabase.storage
    .from("logos")
    .upload(path, fichier, { upsert: true });

  if (error) throw new Error(error.message);
  return supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
}
