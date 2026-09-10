import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Même précaution que /api/site et /api/site-preview.
const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * POST /api/edit-site — "Modifier avec l'IA" dans TemplateGallery.tsx.
 *
 * PAS ENCORE BRANCHÉE : la simulation précédente (simulateAiEdit.ts) a été
 * retirée -- il n'y a plus aucun appel IA ici, réel ou simulé. La
 * validation (entreprise/template/prompt requis, site existant) reste en
 * place pour ne pas avoir à la réécrire quand un vrai modèle sera branché ;
 * seule la lecture/écriture du contenu (le bloc TODO ci-dessous) doit être
 * complétée à ce moment-là.
 */
export async function POST(request: NextRequest) {
  const { entrepriseId, templateId, prompt } = await request.json();

  if (!entrepriseId || !templateId) {
    return NextResponse.json(
      { error: "entrepriseId et templateId requis" },
      { status: 400 }
    );
  }
  if (!SAFE_TEMPLATE_ID.test(templateId)) {
    return NextResponse.json({ error: "Identifiant de template invalide" }, { status: 400 });
  }
  if (!prompt || !String(prompt).trim()) {
    return NextResponse.json({ error: "Décrivez ce que vous voulez modifier." }, { status: 400 });
  }

  // Même mécanisme que /api/site : le jeton de l'utilisateur connecté,
  // nécessaire pour que la policy RLS "site_update_own" accepte la mise à
  // jour (une fois l'édition réellement branchée).
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const supabaseForRequest = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // Le site doit déjà exister (créé via /api/site quand l'utilisateur a
  // cliqué "Choisir") -- cette route ne fait que le MODIFIER, jamais le
  // créer.
  const { data: existing, error: selectError } = await supabaseForRequest
    .from("site")
    .select("id, content")
    .eq("entreprise_id", entrepriseId)
    .eq("template_id", templateId)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json(
      { error: "Aucun site trouvé pour ce template : choisissez-le d'abord." },
      { status: 404 }
    );
  }

  // TODO : appeler le modèle choisi avec `prompt` + `existing.content`, puis
  // faire un .update({ content: <résultat> }).eq("id", existing.id) comme
  // le faisait l'ancienne simulation -- rien d'autre à changer dans cette
  // route.
  return NextResponse.json(
    { error: "L'édition par IA n'est pas encore branchée." },
    { status: 501 }
  );
}
