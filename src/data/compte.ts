// MODEL de la table "compte" (le profil de l'utilisateur : nom, prénom,
// contact) : c'est le SEUL fichier qui écrit des requêtes Supabase dessus.
//
// À ne pas confondre avec la table "auth.users", gérée par Supabase Auth
// (email, mot de passe) : une ligne "compte" a le MÊME id que l'utilisateur
// auth.users correspondant.
import type { SupabaseClient } from "@supabase/supabase-js";

export interface NouveauCompte {
  /** L'id de l'utilisateur créé par supabase.auth.signUp(). */
  id: string;
  nom: string | null;
  prenom: string | null;
  contact: string | null;
}

/** Crée le profil d'un utilisateur qui vient de s'inscrire. */
export async function creerCompte(
  supabase: SupabaseClient,
  input: NouveauCompte
): Promise<void> {
  const { error } = await supabase.from("compte").insert({
    id: input.id,
    nom: input.nom,
    prenom: input.prenom,
    contact: input.contact,
  });

  if (error) throw new Error(error.message);
}
