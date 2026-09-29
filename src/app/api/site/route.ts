import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createServerSupabase } from "@/lib/supabase/server";
import { buildInitialSite } from "@/lib/buildInitialSite";
import { creerSite, getSite, mettreAJourSite } from "@/data/site";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "Templates");

// Même précaution que /api/site-preview : templateId vient du client, on
// refuse tout ce qui pourrait sortir de public/Templates/.
const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * POST /api/site — appelée quand l'utilisateur clique "Choisir" sur un
 * template (voir TemplateGallery.tsx -> handleChoose).
 *
 * Crée le site de cette entreprise pour ce template s'il n'existe pas encore
 * (voir buildInitialSite.ts pour comment le contenu ET le HTML de départ sont
 * construits), ou renvoie celui qui existe déjà -- pour ne pas écraser les
 * modifications IA déjà faites si l'utilisateur re-clique "Choisir" sur un
 * template déjà en cours d'édition.
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

  // Même mécanisme que /api/entreprise et /api/identite-visuelle : le jeton
  // de l'utilisateur connecté, nécessaire pour que la policy RLS de "site"
  // (qui vérifie via entreprise.compte_id) accepte l'insertion.
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Utilisateur non authentifié" },
      { status: 401 }
    );
  }

  const supabase = createServerSupabase(authHeader);

  try {
    const existing = await getSite(supabase, entrepriseId, templateId);

    if (existing?.html) {
      return NextResponse.json({ site: existing });
    }

    const { content, html } = await buildInitialSite(supabase, entrepriseId, templateDir);

    if (existing) {
      // Ligne créée AVANT l'ajout de la colonne "html" (ou jamais remplie
      // pour une autre raison) -- sans ce rattrapage, /api/site-preview
      // n'aurait jamais rien à servir pour ce site et retomberait sur le
      // gabarit générique par défaut. Sans risque d'écraser une édition IA :
      // /api/edit-site exige déjà un `html` existant pour fonctionner, donc
      // si cette colonne est vide, aucune édition n'a pu avoir lieu dessus.
      const healed = await mettreAJourSite(supabase, existing.id, { content, html });
      return NextResponse.json({ site: healed });
    }

    const created = await creerSite(supabase, { entrepriseId, templateId, content, html });
    return NextResponse.json({ site: created });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
