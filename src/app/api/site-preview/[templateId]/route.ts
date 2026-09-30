import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createServerSupabase } from "@/lib/supabase/server";
import { renderSiteTemplate } from "@/lib/renderSiteTemplate";
import { SITE_IA_ID, getSite } from "@/data/site";

// Le HTML servi ici est écrit (ou modifié) par une IA : on l'isole de la
// plateforme. Avec "sandbox", la page a une origine opaque, même ouverte
// directement dans un onglet : ses scripts tournent, mais ne peuvent pas lire
// la session Supabase ni les cookies de l'application.
const EN_TETES_HTML = {
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy": "sandbox allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox",
};

// Affiché tant que le site IA d'une entreprise n'a pas encore été généré.
const PAGE_ATTENTE_IA = `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Votre site</title><style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#f5f5fb;color:#6b6b80;text-align:center}p{max-width:320px;line-height:1.5}</style></head><body><p>Votre site apparaîtra ici dès que vous l'aurez décrit à l'assistant.</p></body></html>`;

const TEMPLATES_DIR = path.join(process.cwd(), "public", "Templates");

// Nom de dossier valide uniquement (lettres/chiffres/-/_) : templateId vient
// de l'URL, on refuse tout ce qui pourrait sortir de public/Templates/
// (même précaution que templatePath dans /api/generate-visual).
const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * Aperçu HTML en direct d'un site : sert le HTML déjà construit pour cette
 * entreprise (colonne "html" de la table "site" -- voir buildInitialSite.ts
 * et /api/edit-site) s'il existe, sinon retombe sur le gabarit par défaut du
 * template, sans identité appliquée.
 *
 * GET /api/site-preview/grilli-master?entrepriseId=xxx
 * -> navigable directement dans un navigateur (répond du text/html, pas du
 *    JSON), utile pour vérifier visuellement le rendu sans passer par une
 *    page dédiée.
 *
 * Volontairement public (pas d'Authorization requis) : contrairement à
 * /api/generate-visual (qui déclenche un appel payant), celle-ci ne fait
 * que lire du HTML déjà généré -- un site est de toute façon destiné à être
 * public. Si `entrepriseId` est fourni mais qu'aucune ligne "site" n'existe
 * (RLS, entreprise inexistante, template jamais choisi...), on retombe
 * simplement sur le gabarit par défaut plutôt que de bloquer l'aperçu.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> }
) {
  const { templateId } = await params;

  if (!SAFE_TEMPLATE_ID.test(templateId)) {
    return NextResponse.json({ error: "Identifiant de template invalide" }, { status: 400 });
  }

  const entrepriseId = request.nextUrl.searchParams.get("entrepriseId");

  // Site créé par conversation avec l'IA : pas de gabarit sur disque, seul
  // le HTML enregistré existe.
  if (templateId === SITE_IA_ID) {
    const site = entrepriseId
      ? await getSite(createServerSupabase(), entrepriseId, SITE_IA_ID).catch(() => null)
      : null;
    return new NextResponse(site?.html ?? PAGE_ATTENTE_IA, { headers: EN_TETES_HTML });
  }

  const templateDir = path.join(TEMPLATES_DIR, templateId);
  if (!fs.existsSync(path.join(templateDir, "index.html"))) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }

  if (entrepriseId) {
    // Le HTML déjà construit pour cette entreprise contient DÉJÀ sa
    // couleur/police/logo "gravés" dedans, donc s'il existe on le sert tel
    // quel, sans repasser par renderSiteTemplate. Absence de ligne (ou
    // erreur de lecture) -> gabarit par défaut ci-dessous.
    const site = await getSite(createServerSupabase(), entrepriseId, templateId).catch(
      () => null
    );

    if (site?.html) {
      return new NextResponse(site.html, { headers: EN_TETES_HTML });
    }
  }

  const html = renderSiteTemplate(templateDir, null, null);

  return new NextResponse(html, { headers: EN_TETES_HTML });
}
