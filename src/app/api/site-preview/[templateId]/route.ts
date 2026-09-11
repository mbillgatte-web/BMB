import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { renderSiteTemplate } from "@/lib/renderSiteTemplate";

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

  const templateDir = path.join(TEMPLATES_DIR, templateId);
  if (!fs.existsSync(path.join(templateDir, "index.html"))) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }

  const entrepriseId = request.nextUrl.searchParams.get("entrepriseId");

  if (entrepriseId) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Le HTML déjà construit pour cette entreprise (voir buildInitialSite.ts
    // à la création, ou /api/edit-site après une édition IA) -- il contient
    // DÉJÀ sa couleur/police/logo "gravés" dedans, donc s'il existe on le
    // sert tel quel, sans repasser par renderSiteTemplate. Absence de ligne
    // = template jamais choisi par cette entreprise -> on retombe sur le
    // gabarit par défaut ci-dessous.
    const { data: site } = await supabase
      .from("site")
      .select("html")
      .eq("entreprise_id", entrepriseId)
      .eq("template_id", templateId)
      .maybeSingle();

    if (site?.html) {
      return new NextResponse(site.html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  }

  const html = renderSiteTemplate(templateDir, null, null);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}