import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const TEMPLATES_DIR = path.join(process.cwd(), "public", "Templates");

// Même précaution que /api/site-preview : templateId vient du client, on
// refuse tout ce qui pourrait sortir de public/Templates/.
const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

/**
 * POST /api/site — appelée quand l'utilisateur clique "Choisir" sur un
 * template (voir TemplateGallery.tsx -> handleChoose).
 *
 * Crée la ligne "site" de cette entreprise pour ce template si elle n'existe
 * pas encore (avec le content.json par défaut du template comme contenu de
 * départ), ou renvoie celle qui existe déjà -- pour ne pas écraser les
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
  const contentPath = path.join(templateDir, "content.json");
  if (!fs.existsSync(contentPath)) {
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

  const supabaseForRequest = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // On regarde d'abord si un site existe déjà pour ce couple entreprise +
  // template, plutôt qu'un upsert avec contrainte unique côté BD (aucune
  // contrainte de ce type n'a été posée sur la table -- une entreprise peut
  // avoir plusieurs sites, seul le couple entreprise+template doit rester
  // unique en pratique).
  const { data: existing, error: selectError } = await supabaseForRequest
    .from("site")
    .select("id, entreprise_id, template_id, content")
    .eq("entreprise_id", entrepriseId)
    .eq("template_id", templateId)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }

  if (existing) {
    return NextResponse.json({ site: existing });
  }

  const defaultContent = JSON.parse(fs.readFileSync(contentPath, "utf-8"));

  // On récupère tout de suite le vrai téléphone (et le nom) de l'entreprise
  // pour les inscrire dans le contenu par défaut -- sans ça, topbar.phone
  // resterait le numéro factice du template ("+1 123 456 7890") jusqu'à ce
  // qu'une édition IA passe par là, ce qui casserait le bouton "Commander"
  // (lien WhatsApp, voir renderSiteTemplate.ts) tant que ce n'est pas fait.
  // Même client authentifié que la lecture "site" ci-dessus : la policy RLS
  // de "entreprise" laisse passer parce que c'est bien SON entreprise
  // (compte_id = auth.uid()).
  const { data: entreprise } = await supabaseForRequest
    .from("entreprise")
    .select("nom, contact")
    .eq("id", entrepriseId)
    .maybeSingle();

  if (entreprise?.nom) {
    defaultContent.brand ??= {};
    defaultContent.brand.name = entreprise.nom;
  }
  if (entreprise?.contact) {
    defaultContent.topbar ??= {};
    defaultContent.topbar.phone = entreprise.contact;
    // Que des chiffres : wa.me (voir renderSiteTemplate.ts) n'accepte pas
    // les espaces/tirets/parenthèses d'un numéro saisi "à la main".
    defaultContent.topbar.phoneHref = entreprise.contact.replace(/[^\d]/g, "");
  }

  const { data: created, error: insertError } = await supabaseForRequest
    .from("site")
    .insert({
      entreprise_id: entrepriseId,
      template_id: templateId,
      content: defaultContent,
    })
    .select("id, entreprise_id, template_id, content")
    .single();

  if (insertError) {
    // "row-level security policy" -> vérifie que la policy site_insert_own
    // compare bien entreprise.compte_id (via jointure) à auth.uid().
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ site: created });
}