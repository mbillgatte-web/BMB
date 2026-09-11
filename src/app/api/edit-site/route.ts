import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Même précaution que /api/site et /api/site-preview.
const SAFE_TEMPLATE_ID = /^[a-zA-Z0-9_-]+$/;

// Modèle texte (pas image -- voir GEMINI_IMAGE_MODEL dans /api/generate-visual
// pour celui-là) : gemini-3.6-flash est dans le tier gratuit de Google AI
// Studio au moment où ce fichier a été écrit (voir le commentaire dans
// .env.local -- gemini-2.5-flash, utilisé avant, a été retiré pour les
// nouveaux comptes).
const GEMINI_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3.6-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * POST /api/edit-site — "Modifier avec l'IA" dans TemplateGallery.tsx.
 *
 * Envoie le content.json actuel du site à Gemini avec une instruction de
 * BASE toujours présente ("adapte ce contenu à cette entreprise précise",
 * avec son nom/secteur/coordonnées déjà en base) -- le prompt libre de
 * l'utilisateur, s'il y en a un, s'ajoute par-dessus comme précision, il ne
 * remplace pas cette base. C'est pour ça que `prompt` est optionnel ici :
 * même vide, l'adaptation à l'entreprise reste une demande utile en soi.
 *
 * `responseMimeType: "application/json"` force Gemini à répondre en JSON
 * strict plutôt qu'en texte libre à parser à la main -- ça évite la
 * plupart des réponses mal formées (markdown autour du JSON, texte
 * d'explication en plus, etc.).
 */
export async function POST(request: NextRequest) {
  const {
    entrepriseId,
    templateId,
    prompt,
    entrepriseNom,
    entrepriseSlogan,
    entrepriseContact,
    entrepriseAdresse,
    entrepriseSecteur,
  } = await request.json();

  if (!entrepriseId || !templateId) {
    return NextResponse.json(
      { error: "entrepriseId et templateId requis" },
      { status: 400 }
    );
  }
  if (!SAFE_TEMPLATE_ID.test(templateId)) {
    return NextResponse.json({ error: "Identifiant de template invalide" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY manquante. Ajoute-la dans .env.local puis redémarre le serveur." },
      { status: 500 }
    );
  }

  // Même mécanisme que /api/site : le jeton de l'utilisateur connecté,
  // nécessaire pour que la policy RLS "site_update_own" accepte la mise à
  // jour.
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

  // Instruction de base : toujours présente, indépendamment du prompt libre
  // (voir le commentaire de la route). N'inclut que les champs réellement
  // connus -- si l'entreprise n'a pas encore d'adresse ou de secteur
  // renseigné, pas la peine de demander à Gemini d'adapter un champ vide.
  const identiteLines = [
    entrepriseNom && `Nom de l'entreprise : ${entrepriseNom}`,
    entrepriseSecteur && `Secteur d'activité : ${entrepriseSecteur}`,
    entrepriseAdresse && `Adresse : ${entrepriseAdresse}`,
    entrepriseContact && `Téléphone : ${entrepriseContact}`,
    entrepriseSlogan && `Slogan : ${entrepriseSlogan}`,
  ].filter(Boolean);

  const promptTrimmed = String(prompt ?? "").trim();

  const instructions = [
    `Tu édites le contenu JSON d'un site web (restaurant). Voici le JSON actuel :`,
    JSON.stringify(existing.content),
    ``,
    identiteLines.length
      ? [
          `Adapte ce contenu à l'entreprise suivante (remplace le nom de marque, les ` +
            `coordonnées, et adapte les textes à son secteur réel) :`,
          ...identiteLines.map((line) => `- ${line}`),
        ].join("\n")
      : `Aucune information d'entreprise connue pour l'instant : garde le contenu ` +
        `générique du template tel quel, sauf si l'instruction ci-dessous dit le contraire.`,
    ``,       
    promptTrimmed
      ? `Instruction supplémentaire de l'utilisateur : ${promptTrimmed}`
      : ``,
    ``,
    `Renvoie UNIQUEMENT un JSON avec EXACTEMENT les mêmes clés et la même structure ` +
      `que le JSON ci-dessus (mêmes tableaux, même nombre d'éléments dans chaque ` +
      `tableau, mêmes champs "image"/"icon" inchangés puisqu'il s'agit de chemins ` +
      `de fichiers existants). Modifie uniquement les textes concernés. Le texte ` +
      `doit être en français, cohérent, sans faute d'orthographe.`,
  ].join("\n");

  const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: instructions }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });

  const geminiData = await geminiRes.json();

  if (!geminiRes.ok) {
    // Remonte le message d'erreur brut de Google : si GEMINI_TEXT_MODEL
    // pointe vers un nom de modèle invalide ou déprécié, l'erreur le dit
    // explicitement (même logique que /api/generate-visual).
    return NextResponse.json(
      { error: geminiData?.error?.message ?? "Erreur de l'API Gemini" },
      { status: geminiRes.status }
    );
  }

  const rawText: string | undefined =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    return NextResponse.json(
      {
        error:
          "Gemini n'a renvoyé aucun contenu pour cette demande (contenu peut-être filtré). Réessaie avec un autre prompt.",
      },
      { status: 502 }
    );
  }

  let newContent: unknown;
  try {
    newContent = JSON.parse(rawText);
  } catch {
    return NextResponse.json(
      { error: "Gemini a renvoyé un JSON invalide. Réessaie." },
      { status: 502 }
    );
  }

  if (typeof newContent !== "object" || newContent === null) {
    return NextResponse.json(
      { error: "Gemini a renvoyé un contenu inattendu. Réessaie." },
      { status: 502 }
    );
  }


// sauvegarde de la bd du JSON modifié par Gemini dans la table "site" de Supabase

  const { data: updated, error: updateError } = await supabaseForRequest
    .from("site")
    .update({ content: newContent, updated_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select("id, content")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ site: updated });
}




