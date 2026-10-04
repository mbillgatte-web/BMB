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
  /**
   * Publication (voir supabase/migrations/*_publication_site.sql) : `slug`
   * est l'adresse publique (/s/<slug>), attribuée à la première publication
   * et conservée ensuite ; `html_publie` est la copie figée servie aux
   * visiteurs (la colonne `html` reste le brouillon en cours d'édition).
   */
  slug: string | null;
  est_publie: boolean;
  html_publie: string | null;
  publie_le: string | null;
}

const COLONNES =
  "id, entreprise_id, template_id, content, html, slug, est_publie, html_publie, publie_le";

/**
 * Identifiant réservé du site créé par conversation avec l'IA, sans partir
 * d'un template (voir /api/generate-site). Il occupe la place d'un template
 * dans le couple (entreprise_id, template_id) : un seul site IA par
 * entreprise. Aucun dossier public/Templates/ia n'existe derrière.
 */
export const SITE_IA_ID = "ia";

/** Un message de la conversation de création du site IA. */
export interface MessageSiteIA {
  role: "user" | "assistant";
  text: string;
  /** Image épinglée par l'utilisateur avec ce message, s'il y en a une. */
  imageUrl?: string;
}

/**
 * La conversation est rangée dans la colonne `content` du site IA (qui, pour
 * un site issu d'un template, contient le content.json de ce template).
 */
export function messagesDuSiteIA(site: Site | null): MessageSiteIA[] {
  const messages = site?.content?.messages;
  if (!Array.isArray(messages)) return [];
  return messages.filter(
    (m): m is MessageSiteIA =>
      typeof m === "object" &&
      m !== null &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.text === "string"
  );
}

/**
 * Résumé d'un site, sans les colonnes HTML (plusieurs centaines de Ko par
 * site) : suffisant pour afficher un état « en ligne / brouillon » et une
 * adresse (tableau de bord, galerie des modèles).
 */
export type SiteResume = Pick<
  Site,
  "id" | "template_id" | "slug" | "est_publie" | "publie_le"
>;

/**
 * Tous les sites d'une entreprise (un par template, plus l'éventuel site
 * IA), sans leur HTML. Les sites publiés d'abord, puis du plus récemment
 * publié au plus ancien, pour que le premier de la liste soit celui à
 * mettre en avant.
 */
export async function listSitesDeLEntreprise(
  supabase: SupabaseClient,
  entrepriseId: string
): Promise<SiteResume[]> {
  const { data, error } = await supabase
    .from("site")
    .select("id, template_id, slug, est_publie, publie_le")
    .eq("entreprise_id", entrepriseId)
    .order("est_publie", { ascending: false })
    .order("publie_le", { ascending: false, nullsFirst: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

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

// ---------------------------------------------------------------------------
// Publication (voir supabase/migrations/*_publication_site.sql)
// ---------------------------------------------------------------------------

/** Contraintes d'un slug : minuscules, chiffres, tirets, 3 à 40 caractères. */
const SLUG_MIN = 3;
const SLUG_MAX = 40;

/**
 * Transforme un nom d'entreprise en slug d'URL : « Chez Mamá & Fils » ->
 * « chez-mama-fils ». Sans accents, en minuscules, un seul tiret entre les
 * mots, jamais de tiret en bord. Un nom trop court est complété par
 * « -site » ; un nom vide devient « mon-site ».
 */
export function slugifier(nom: string): string {
  let slug = nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // retire les accents décomposés par NFD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");

  if (!slug) slug = "mon-site";
  if (slug.length < SLUG_MIN) slug = `${slug}-site`;
  return slug;
}

/**
 * Slug unique parmi `existants` : le slug de base, puis -2, -3… en cas de
 * collision. Le suffixe est ajouté APRÈS avoir raccourci la base pour ne
 * jamais dépasser SLUG_MAX.
 */
export function genererSlug(nom: string, existants: string[]): string {
  const pris = new Set(existants);
  const base = slugifier(nom);
  if (!pris.has(base)) return base;

  for (let n = 2; ; n++) {
    const suffixe = `-${n}`;
    const candidat =
      base.slice(0, SLUG_MAX - suffixe.length).replace(/-+$/g, "") + suffixe;
    if (!pris.has(candidat)) return candidat;
  }
}

/**
 * Les slugs déjà attribués, tels que ce client peut les voir. Avec le
 * client d'un utilisateur, la RLS ne montre que SES sites : cette liste sert
 * de première passe (éviter la collision entre ses propres sites), la vraie
 * garantie d'unicité étant la contrainte `unique` de la colonne (voir le
 * rattrapage dans publierSite).
 */
export async function listerSlugsExistants(supabase: SupabaseClient): Promise<string[]> {
  const { data, error } = await supabase
    .from("site")
    .select("slug")
    .not("slug", "is", null);

  if (error) throw new Error(error.message);
  return (data ?? [])
    .map((ligne: { slug: string | null }) => ligne.slug)
    .filter((s): s is string => Boolean(s));
}

/** Code Postgres d'une violation de contrainte unique. */
const CODE_UNIQUE_VIOLATION = "23505";

/**
 * Publie (ou republie) un site : fige `htmlFinal` dans html_publie, passe
 * est_publie à true et date la publication. Le slug existant est conservé
 * (l'adresse d'un site ne change jamais) ; sinon il est généré à partir de
 * `nomEntreprise`.
 *
 * Une collision de slug avec le site d'un AUTRE compte (invisible via RLS,
 * donc absent de listerSlugsExistants) est rattrapée ici : Postgres refuse
 * l'écriture (23505) et on réessaie avec le suffixe suivant.
 */
export async function publierSite(
  supabase: SupabaseClient,
  siteId: string,
  htmlFinal: string,
  nomEntreprise: string
): Promise<Site> {
  const { data: actuel, error: erreurLecture } = await supabase
    .from("site")
    .select("slug")
    .eq("id", siteId)
    .single();
  if (erreurLecture) throw new Error(erreurLecture.message);

  const maintenant = new Date().toISOString();
  const champs = {
    html_publie: htmlFinal,
    est_publie: true,
    publie_le: maintenant,
    updated_at: maintenant,
  };

  if (actuel.slug) {
    const { data, error } = await supabase
      .from("site")
      .update(champs)
      .eq("id", siteId)
      .select(COLONNES)
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  const existants = await listerSlugsExistants(supabase);

  // Borne haute arbitraire : au-delà, quelque chose cloche (autre erreur
  // masquée), inutile de boucler sans fin.
  for (let tentative = 0; tentative < 20; tentative++) {
    const slug = genererSlug(nomEntreprise, existants);
    const { data, error } = await supabase
      .from("site")
      .update({ ...champs, slug })
      .eq("id", siteId)
      .select(COLONNES)
      .single();

    if (!error) return data;
    if (error.code !== CODE_UNIQUE_VIOLATION) throw new Error(error.message);
    existants.push(slug);
  }

  throw new Error("Impossible d'attribuer une adresse à ce site. Réessayez.");
}

/**
 * Dépublie un site : /s/<slug> répond 404, mais le slug et html_publie sont
 * conservés pour pouvoir republier immédiatement à la même adresse.
 */
export async function depublierSite(supabase: SupabaseClient, siteId: string): Promise<Site> {
  const { data, error } = await supabase
    .from("site")
    .update({ est_publie: false, updated_at: new Date().toISOString() })
    .eq("id", siteId)
    .select(COLONNES)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/** Ce que la fonction SQL `site_publie` renvoie pour un site publié. */
export interface SitePublie {
  html_publie: string;
  publie_le: string | null;
}

/**
 * Le HTML figé d'un site publié, par son slug, ou null s'il n'existe pas ou
 * n'est pas publié. Passe par la fonction SQL `site_publie` (security
 * definer, voir la migration) : fonctionne avec le client anonyme, sans
 * aucune policy publique sur la table `site`.
 */
export async function getSitePublie(
  supabase: SupabaseClient,
  slug: string
): Promise<SitePublie | null> {
  const { data, error } = await supabase.rpc("site_publie", { p_slug: slug });

  if (error) throw new Error(error.message);
  const ligne = Array.isArray(data) ? (data[0] as SitePublie | undefined) : undefined;
  return ligne?.html_publie ? ligne : null;
}
