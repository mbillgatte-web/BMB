import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { renderSiteTemplate, type TemplateIdentity } from "@/lib/renderSiteTemplate";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "Templates");

// Nom de dossier valide uniquement (lettres/chiffres/-/_) : templateId vient
// de l'URL, on refuse tout ce qui pourrait sortir de public/Templates/
// (même précaution que templatePath dans /api/generate-visual).
const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * Aperçu HTML en direct d'un template de site, avec l'identité visuelle
 * d'une entreprise appliquée par-dessus (voir renderSiteTemplate.ts).
 *
 * GET /api/site-preview/grilli-master?entrepriseId=xxx
 * -> navigable directement dans un navigateur (répond du text/html, pas du
 *    JSON), utile pour vérifier visuellement le rendu sans passer par une
 *    page dédiée.
 *
 * Volontairement public (pas d'Authorization requis) : contrairement à
 * /api/generate-visual (qui déclenche un appel payant), celle-ci ne fait
 * que lire des fichiers statiques + une couleur/police déjà publique par
 * nature (l'identité visuelle d'une entreprise est destinée à finir sur son
 * futur site public). Si `entrepriseId` est fourni mais que la lecture
 * échoue (RLS, entreprise inexistante...), on retombe simplement sur le
 * style par défaut du template plutôt que de bloquer l'aperçu.
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
  let identite: TemplateIdentity | null = null;
  let contentOverride: Record<string, unknown> | null = null;

  if (entrepriseId) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data } = await supabase
      .from("identite_visuelle")
      .select("couleur_primaire, police_titre, police_texte, logo_url")
      .eq("entreprise_id", entrepriseId)
      .maybeSingle();

    identite = data ?? null;

    // Contenu déjà sauvegardé pour cette entreprise sur ce template (table
    // "site", créée via /api/site quand elle a cliqué "Choisir") -- s'il
    // existe, il prend le pas sur le content.json par défaut du template
    // (voir renderSiteTemplate.ts). Absence de ligne = template jamais
    // choisi par cette entreprise -> on garde le contenu par défaut.
    const { data: site } = await supabase
      .from("site")
      .select("content")
      .eq("entreprise_id", entrepriseId)
      .eq("template_id", templateId)
      .maybeSingle();

    contentOverride = site?.content ?? null;
  }

  const html = renderSiteTemplate(templateDir, identite, contentOverride);

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}