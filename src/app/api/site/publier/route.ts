import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createServerSupabase } from "@/lib/supabase/server";
import { renderSiteTemplate } from "@/lib/renderSiteTemplate";
import { getEntreprise } from "@/data/entreprise";
import { getIdentiteVisuelle } from "@/data/identiteVisuelle";
import { SITE_IA_ID, getSite, mettreAJourSite, publierSite } from "@/data/site";
import { metaPourEntreprise } from "@/lib/buildInitialSite";

/** Échappe une chaîne pour l'insérer dans du HTML (title, attribut content). */
function echapperHtml(texte: string) {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/**
 * Les sites créés avant que buildInitialSite remplisse `meta` ont gardé le
 * titre du modèle (« Foodie - Burgers… ») dans leur <title> et leur
 * description. On les rattrape ici : si le titre actuel est encore celui du
 * content.json du modèle, on le remplace par celui de l'entreprise, dans le
 * HTML et dans le contenu (pour que l'aperçu et l'édition IA suivent).
 */
function corrigerMetaSiDefaut(
  html: string,
  content: Record<string, unknown> | null,
  templateDir: string,
  meta: { title: string; description: string }
): { html: string; content: Record<string, unknown> | null; modifie: boolean } {
  const defaut = JSON.parse(fs.readFileSync(path.join(templateDir, "content.json"), "utf-8")).meta as
    | { title?: string; description?: string }
    | undefined;
  if (!defaut?.title) return { html, content, modifie: false };

  const titreDefaut = `<title>${defaut.title}</title>`;
  if (!html.includes(titreDefaut)) return { html, content, modifie: false };

  let htmlCorrige = html.replace(titreDefaut, `<title>${echapperHtml(meta.title)}</title>`);
  if (defaut.description) {
    htmlCorrige = htmlCorrige.replace(
      `content="${defaut.description}"`,
      `content="${echapperHtml(meta.description)}"`
    );
  }
  const contentCorrige = content ? { ...content, meta: { ...(content.meta as object), ...meta } } : content;
  return { html: htmlCorrige, content: contentCorrige, modifie: true };
}

const TEMPLATES_DIR = path.join(process.cwd(), "public", "Templates");
const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * POST /api/site/publier { entrepriseId, templateId }
 *
 * Fige le site de cette entreprise pour ce template dans `html_publie` et le
 * rend accessible à /s/<slug> (voir src/app/s/[slug]/route.ts). Republier
 * remplace la copie figée par l'état actuel du brouillon ; le slug, lui, ne
 * change jamais (l'adresse d'un site publié reste stable).
 *
 * Le HTML publié est celui que l'aperçu affiche déjà (colonne `html`, avec
 * l'identité de l'entreprise gravée dedans). S'il manque (ligne ancienne), on
 * le reconstruit depuis le gabarit et le contenu enregistré.
 */
export async function POST(request: NextRequest) {
  // L'authentification est vérifiée AVANT de lire le corps : une requête
  // anonyme reçoit toujours 401, même si son JSON est illisible.
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  let corps: { entrepriseId?: string; templateId?: string };
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide (JSON attendu)" }, { status: 400 });
  }
  const { entrepriseId, templateId } = corps;

  if (!entrepriseId || !templateId) {
    return NextResponse.json({ error: "entrepriseId et templateId requis" }, { status: 400 });
  }
  if (!SAFE_TEMPLATE_ID.test(templateId)) {
    return NextResponse.json({ error: "Identifiant de template invalide" }, { status: 400 });
  }

  const supabase = createServerSupabase(authHeader);

  try {
    const site = await getSite(supabase, entrepriseId, templateId);
    if (!site) {
      return NextResponse.json({ error: "Ce site n'existe pas encore." }, { status: 404 });
    }

    let htmlFinal = site.html;
    if (!htmlFinal) {
      if (templateId === SITE_IA_ID) {
        return NextResponse.json(
          { error: "Décrivez d'abord votre site à l'assistant avant de le publier." },
          { status: 400 }
        );
      }
      const templateDir = path.join(TEMPLATES_DIR, templateId);
      if (!fs.existsSync(path.join(templateDir, "index.html"))) {
        return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
      }
      const identite = await getIdentiteVisuelle(supabase, entrepriseId).catch(() => null);
      htmlFinal = renderSiteTemplate(templateDir, identite, site.content);
    }

    const entreprise = await getEntreprise(supabase, entrepriseId);

    if (entreprise && templateId !== SITE_IA_ID) {
      const corrige = corrigerMetaSiDefaut(
        htmlFinal,
        site.content,
        path.join(TEMPLATES_DIR, templateId),
        metaPourEntreprise(entreprise)
      );
      if (corrige.modifie) {
        htmlFinal = corrige.html;
        // Le brouillon aussi, sinon l'aperçu garderait l'ancien titre et la
        // prochaine republication repartirait du mauvais HTML.
        await mettreAJourSite(supabase, site.id, {
          html: htmlFinal,
          content: corrige.content ?? undefined,
        });
      }
    }

    const publie = await publierSite(supabase, site.id, htmlFinal, entreprise?.nom ?? "mon-site");

    return NextResponse.json({
      slug: publie.slug,
      publie_le: publie.publie_le,
      url: `${request.nextUrl.origin}/s/${publie.slug}`,
    });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
