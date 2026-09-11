import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { renderSiteTemplate, type TemplateIdentity } from "./renderSiteTemplate";

/**
 * Construit le contenu ET le HTML de départ d'un site, pour une entreprise
 * donnée sur un template donné -- utilisé à la fois par /api/site (première
 * création, quand l'utilisateur clique "Choisir") et par /api/reset-site
 * ("Réinitialiser au template d'origine", voir TemplateGallery.tsx).
 *
 * Contrairement à /api/site-preview (qui utilise la clé anonyme et relit
 * l'identité à CHAQUE affichage), ici `supabase` est le client authentifié
 * de la requête en cours -- on peut donc lire "entreprise" ET
 * "identite_visuelle" directement (RLS : c'est bien SON entreprise), sans
 * policy publique. Le HTML obtenu a donc déjà la bonne couleur/police/logo
 * "gravés" dedans -- c'est justement le principe retenu pour l'édition IA
 * (voir /api/edit-site) : elle édite ce HTML déjà personnalisé, pas un
 * gabarit générique.
 */
export async function buildInitialSite(
  supabase: SupabaseClient,
  entrepriseId: string,
  templateDir: string
): Promise<{ content: Record<string, unknown>; html: string }> {
  const contentPath = path.join(templateDir, "content.json");
  const defaultContent = JSON.parse(fs.readFileSync(contentPath, "utf-8"));

  const [{ data: entreprise }, { data: identiteRow }] = await Promise.all([
    supabase.from("entreprise").select("nom, contact").eq("id", entrepriseId).maybeSingle(),
    supabase
      .from("identite_visuelle")
      .select("couleur_primaire, police_titre, police_texte, logo_url")
      .eq("entreprise_id", entrepriseId)
      .maybeSingle(),
  ]);

  if (entreprise?.nom) {
    defaultContent.brand ??= {};
    defaultContent.brand.name = entreprise.nom;
  }
  if (entreprise?.contact) {
    defaultContent.topbar ??= {};
    defaultContent.topbar.phone = entreprise.contact;
    // Que des chiffres : wa.me (voir renderSiteTemplate.ts) n'accepte pas
    // les espaces/tirets/parenthèses d'un numéro saisi "à la main".
    defaultContent.topbar.phoneHref = entreprise.contact.replace(/[^\d]/g, "");
  }

  const identite: TemplateIdentity | null = identiteRow ?? null;
  const html = renderSiteTemplate(templateDir, identite, defaultContent);

  return { content: defaultContent, html };
}
