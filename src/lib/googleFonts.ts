/**
 * Correspondance nom de police -> paramètre de requête Google Fonts (API
 * css2). Sert à construire dynamiquement la balise <link> de police d'un
 * template de site (voir renderSiteTemplate.ts) : changer une variable CSS
 * ne suffit pas, il faut aussi que le navigateur ait effectivement
 * téléchargé cette police via ce lien.
 *
 * IMPORTANT : garder cette liste synchronisée avec FONT_FAMILY_VARS dans
 * src/components/Identite_visuel/police.tsx (les 7 polices proposées à
 * l'utilisateur pour son identité visuelle) -- une police choisie là-bas
 * mais absente d'ici ne s'affichera jamais correctement dans un template.
 * Les 2 dernières entrées (Forum, DM Sans) sont les polices d'origine du
 * template Grilli, pas des polices d'identité de marque -- gardées ici pour
 * que le rendu par défaut (sans identité configurée) fonctionne aussi.
 */
export const GOOGLE_FONT_QUERY: Record<string, string> = {
  Inter: "family=Inter:wght@400;700",
  "Playfair Display": "family=Playfair+Display:wght@400;700",
  Montserrat: "family=Montserrat:wght@400;600;700",
  "Open Sans": "family=Open+Sans:wght@400;700",
  Merriweather: "family=Merriweather:wght@400;700",
  Lato: "family=Lato:wght@400;700",
  Manrope: "family=Manrope:wght@400;700;800",
  Forum: "family=Forum",
  "DM Sans": "family=DM+Sans:wght@400;700",
};