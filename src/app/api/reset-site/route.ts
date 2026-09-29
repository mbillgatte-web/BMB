import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildInitialSite } from "@/lib/buildInitialSite";
import { getSite, mettreAJourSite } from "@/data/site";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "Templates");

const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * POST /api/reset-site — "Réinitialiser au template d'origine" dans
 * TemplateGallery.tsx.
 *
 * Filet de sécurité pour /api/edit-site : comme l'IA édite maintenant le
 * HTML complet du site (voir son commentaire), un enchaînement de
 * corrections peut devenir confus à rattraper par le chat -- ce bouton
 * reconstruit le site EXACTEMENT comme au premier "Choisir" (même logique,
 * voir buildInitialSite.ts), effaçant toutes les éditions IA faites depuis.
 */
export async function POST(request: NextRequest) {
  const { entrepriseId, templateId } = await request.json();

  if (!entrepriseId || !templateId) {
    return NextResponse.json(
      { error: "entrepriseId et templateId requis" },
      { status: 400 }
    );
  }
  if (!SAFE_TEMPLATE_ID.test(templateId)) {
    return NextResponse.json({ error: "Identifiant de template invalide" }, { status: 400 });
  }

  const templateDir = path.join(TEMPLATES_DIR, templateId);
  if (!fs.existsSync(path.join(templateDir, "content.json"))) {
    return NextResponse.json({ error: "Template introuvable" }, { status: 404 });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const supabase = createServerSupabase(authHeader);

  try {
    // Le site doit déjà exister (sinon rien à réinitialiser -- l'utilisateur
    // n'a qu'à cliquer "Choisir", qui fait exactement la même construction).
    const existing = await getSite(supabase, entrepriseId, templateId);
    if (!existing) {
      return NextResponse.json(
        { error: "Aucun site trouvé pour ce template." },
        { status: 404 }
      );
    }

    const { content, html } = await buildInitialSite(supabase, entrepriseId, templateDir);
    const updated = await mettreAJourSite(supabase, existing.id, { content, html });
    return NextResponse.json({ site: updated });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
