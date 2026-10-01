import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { renderSiteTemplate, type TemplateIdentity } from "./renderSiteTemplate";
import { getEntreprise, libelleSecteur, type Entreprise } from "@/data/entreprise";
import { getIdentiteVisuelle } from "@/data/identiteVisuelle";

/**
 * Titre et description de la page (balises <title> et <meta description>)
 * pour une entreprise : « Nom — slogan », ou « Nom — secteur » sans slogan.
 * C'est ce qu'affichent l'onglet du navigateur, Google et les aperçus
 * WhatsApp ; sans ça, le site publié garderait le titre du modèle
 * (« Foodie - Burgers… »).
 */
export function metaPourEntreprise(entreprise: Entreprise): { title: string; description: string } {
  const secteur = libelleSecteur(entreprise.secteur_activite);
  const complement = entreprise.slogan?.trim() || secteur || "";
  const title = complement ? `${entreprise.nom} — ${complement}` : entreprise.nom;

  const lieu = entreprise.adresse?.trim();
  const description =
    entreprise.slogan?.trim() ||
    [entreprise.nom, secteur ? `${secteur.toLowerCase()}` : null, lieu ? `à ${lieu}` : null]
      .filter(Boolean)
      .join(", ") + ".";

  return { title, description };
}

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

  // En cas d'erreur de lecture, on garde le contenu/style par défaut du
  // template plutôt que de faire échouer toute la création du site.
  const [entreprise, identiteRow] = await Promise.all([
    getEntreprise(supabase, entrepriseId).catch(() => null),
    getIdentiteVisuelle(supabase, entrepriseId).catch(() => null),
  ]);

  if (entreprise?.nom) {
    defaultContent.brand ??= {};
    defaultContent.brand.name = entreprise.nom;
    defaultContent.meta = { ...(defaultContent.meta ?? {}), ...metaPourEntreprise(entreprise) };
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
