import fs from "fs";
import path from "path";
import { GOOGLE_FONT_QUERY } from "./googleFonts";

/** Sous-ensemble de IdentiteVisuelle (voir useIdentiteVisuelle.ts) réellement utilisé ici. */
export interface TemplateIdentity {
  couleur_primaire?: string | null;
  police_titre?: string | null;
  police_texte?: string | null;
}

interface TemplateStyle {
  colorPrimary: string;
  fontHeading: string;
  fontBody: string;
}

/**
 * Résout un chemin en pointillés ("hero.slides.0.image") dans un objet
 * imbriqué -- les index de tableau s'écrivent comme des clés numériques
 * ("slides.0"), pas de syntaxe [0].
 */
function resolvePath(data: unknown, tokenPath: string): unknown {
  return tokenPath.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, data);
}

/**
 * Remplace tous les jetons {{chemin.vers.valeur}} d'un gabarit HTML par les
 * valeurs de `data`. Volontairement simple (une regex, pas de boucles/
 * conditions) : les tableaux de content.json ont une longueur fixe pour un
 * template donné (ex: toujours 6 plats pour Grilli), donc chaque jeton
 * référence un index précis plutôt que d'itérer.
 */
function fillTemplate(html: string, data: Record<string, unknown>): string {
  return html.replace(/\{\{([\w.]+)\}\}/g, (match, tokenPath: string) => {
    const value = resolvePath(data, tokenPath);
    return value === undefined || value === null ? "" : String(value);
  });
}

/**
 * Construit les valeurs de style à injecter : part du style.json propre au
 * template (son look d'origine), et laisse l'identité visuelle de
 * l'entreprise (si elle existe en base) prendre le dessus champ par champ.
 *
 * Ne mappe QUE la couleur primaire + les 2 polices -- pas couleur_fond ni
 * couleur_accent (voir le commentaire dans style.json : ce template a un
 * thème sombre construit sur ~6 nuances de noir, pas "un" fond ; y injecter
 * une seule couleur de fond depuis la BD casserait le contraste du texte).
 */
function buildStyleData(defaultStyle: TemplateStyle, identite?: TemplateIdentity | null) {
  const colorPrimary = identite?.couleur_primaire || defaultStyle.colorPrimary;
  const fontHeading = identite?.police_titre || defaultStyle.fontHeading;
  const fontBody = identite?.police_texte || defaultStyle.fontBody;

  // Les 2 polices peuvent être identiques (l'utilisateur a choisi la même
  // pour titres et texte) -- Set() évite de la demander deux fois à Google.
  const fontQueries = Array.from(
    new Set(
      [fontHeading, fontBody]
        .map((name) => GOOGLE_FONT_QUERY[name])
        .filter((q): q is string => Boolean(q))
    )
  );

  // Si un nom de police n'est pas dans GOOGLE_FONT_QUERY (ne devrait pas
  // arriver tant que la table reste synchronisée avec police.tsx, voir son
  // commentaire), fontQueries peut être vide -- on ne génère alors aucun
  // <link>, la page retombe sur les polices système par défaut du
  // navigateur plutôt que sur un lien cassé.
  const googleFontsHref = fontQueries.length
    ? `https://fonts.googleapis.com/css2?${fontQueries.join("&")}&display=swap`
    : "";

  const cssOverrides =
    `<style>:root{` +
    `--gold-crayola:${colorPrimary};` +
    `--fontFamily-forum:'${fontHeading}';` +
    `--fontFamily-dm_sans:'${fontBody}';` +
    `}</style>`;

  return { googleFontsHref, cssOverrides };
}

/**
 * Rend le HTML final d'un template de site : lit son gabarit + son
 * content.json + son style.json sur disque (public/Templates/<id>/),
 * applique l'identité visuelle de l'entreprise par-dessus le style par
 * défaut du template si elle est fournie, et renvoie le HTML complet prêt
 * à être servi tel quel.
 *
 * `templateDir` est un chemin ABSOLU sur disque (ex:
 * path.join(process.cwd(), "public", "Templates", "grilli-master")) --
 * à l'appelant de le construire et de valider que l'id vient d'une liste
 * connue plutôt que d'une entrée utilisateur brute (même précaution que
 * getVisuelsByCategory dans visuelsFs.ts).
 *
 * `contentOverride`, s'il est fourni, remplace le content.json par défaut du
 * template -- c'est le contenu sauvegardé en base pour CETTE entreprise
 * (table "site", voir /api/site), qui peut déjà avoir été modifié par
 * l'édition IA. Sans lui, on retombe sur le contenu par défaut du template
 * (cas d'un aperçu sans entreprise, ou d'un template jamais choisi).
 */
export function renderSiteTemplate(
  templateDir: string,
  identite?: TemplateIdentity | null,
  contentOverride?: Record<string, unknown> | null
): string {
  const html = fs.readFileSync(path.join(templateDir, "index.html"), "utf-8");
  const content =
    contentOverride ??
    JSON.parse(fs.readFileSync(path.join(templateDir, "content.json"), "utf-8"));
  const defaultStyle: TemplateStyle = JSON.parse(
    fs.readFileSync(path.join(templateDir, "style.json"), "utf-8")
  );

  const style = buildStyleData(defaultStyle, identite);
  const merged = fillTemplate(html, { ...content, style });

  // Le gabarit référence ses propres assets en relatif ("./assets/...",
  // "./favicon.svg"), pensé pour être servi depuis son propre dossier
  // (public/Templates/<id>/index.html). Quand on le sert plutôt via une
  // route comme /api/site-preview/<id>, ces chemins relatifs résoudraient
  // au mauvais endroit -- on les réécrit donc vers le vrai chemin public
  // du dossier du template, déduit de `templateDir`.
  const publicPath = `/${path
    .relative(path.join(process.cwd(), "public"), templateDir)
    .split(path.sep)
    .join("/")}`;

  return merged
    .replace(/((?:src|href)=")\.\//g, `$1${publicPath}/`)
    .replace(/url\((['"]?)\.\//g, `url($1${publicPath}/`);
}


