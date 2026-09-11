import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { buildInitialSite } from "@/lib/buildInitialSite";

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

  const supabaseForRequest = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Le site doit déjà exister (sinon rien à réinitialiser -- l'utilisateur
  // n'a qu'à cliquer "Choisir", qui fait exactement la même construction).
  const { data: existing, error: selectError } = await supabaseForRequest
    .from("site")
    .select("id")
    .eq("entreprise_id", entrepriseId)
    .eq("template_id", templateId)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json(
      { error: "Aucun site trouvé pour ce template." },
      { status: 404 }
    );
  }

  const { content, html } = await buildInitialSite(
    supabaseForRequest,
    entrepriseId,
    templateDir
  );

  const { data: updated, error: updateError } = await supabaseForRequest
    .from("site")
    .update({ content, html, updated_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select("id, content, html")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ site: updated });
}
