import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { depublierSite, getSite } from "@/data/site";

const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * POST /api/site/depublier { entrepriseId, templateId }
 *
 * Retire le site de /s/<slug> (404 pour les visiteurs). Le slug et la copie
 * figée sont conservés : republier remet le site en ligne à la même adresse.
 */
export async function POST(request: NextRequest) {
  const { entrepriseId, templateId } = await request.json();

  if (!entrepriseId || !templateId) {
    return NextResponse.json({ error: "entrepriseId et templateId requis" }, { status: 400 });
  }
  if (!SAFE_TEMPLATE_ID.test(templateId)) {
    return NextResponse.json({ error: "Identifiant de template invalide" }, { status: 400 });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }
  const supabase = createServerSupabase(authHeader);

  try {
    const site = await getSite(supabase, entrepriseId, templateId);
    if (!site) {
      return NextResponse.json({ error: "Ce site n'existe pas." }, { status: 404 });
    }
    const maj = await depublierSite(supabase, site.id);
    return NextResponse.json({ slug: maj.slug, est_publie: maj.est_publie });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
