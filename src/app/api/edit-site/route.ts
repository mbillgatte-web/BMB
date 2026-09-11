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
 * Contrairement à la version précédente (qui envoyait le petit content.json
 * à Gemini), on envoie maintenant le HTML COMPLET du site (colonne "html" de
 * la table "site", déjà personnalisé -- voir buildInitialSite.ts) et on
 * demande à Gemini de le réécrire, avec une consigne délibérément stricte :
 * n'appliquer QUE la demande, ne rien changer d'autre. C'est plus risqué
 * qu'éditer du JSON structuré (rien ne garantit que le HTML renvoyé soit
 * valide ou visuellement correct), mais ça permet à l'IA d'ajouter/retirer
 * des éléments (plus de plats, une section en moins...) sans qu'on ait
 * nous-mêmes à construire un moteur de répétition de blocs. Le risque d'une
 * réponse mal formée est acceptable ici parce que l'utilisateur peut
 * toujours redemander une correction dans le même chat -- et /api/reset-site
 * sert de filet de sécurité pour repartir de zéro si besoin.
 *
 * Pas de `responseMimeType: "application/json"` ici (contrairement à
 * l'ancienne version) : la réponse attendue est du HTML, pas du JSON.
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
  // Contrairement à l'ancienne version, le prompt est de nouveau obligatoire
  // ici : l'adaptation à l'entreprise (nom, téléphone...) est déjà faite une
  // fois pour toutes à la création (voir buildInitialSite.ts) -- il n'y a
  // plus de "base" utile à appliquer sans demande précise.
  if (!prompt || !String(prompt).trim()) {
    return NextResponse.json({ error: "Décrivez ce que vous voulez modifier." }, { status: 400 });
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
    .select("id, html")
    .eq("entreprise_id", entrepriseId)
    .eq("template_id", templateId)
    .maybeSingle();

  if (selectError) {
    return NextResponse.json({ error: selectError.message }, { status: 500 });
  }
  if (!existing?.html) {
    return NextResponse.json(
      { error: "Aucun site trouvé pour ce template : choisissez-le d'abord." },
      { status: 404 }
    );
  }

  const instructions = [
    `Tu es un éditeur de code HTML extrêmement précis et discipliné. Voici le ` +
      `code HTML complet actuel d'un site web :`,
    existing.html,
    ``,
    `Consigne STRICTE : applique UNIQUEMENT la demande ci-dessous, à la lettre. ` +
      `Ne modifie RIEN d'autre : ni les textes non concernés, ni les classes CSS, ` +
      `ni les balises <script> ou <style>, ni la structure, ni les attributs -- ` +
      `sauf si la demande l'exige explicitement. Si la demande implique d'ajouter ` +
      `des éléments (ex: plus de plats, une nouvelle carte), copie fidèlement la ` +
      `structure et les classes CSS d'un élément existant du même type pour créer ` +
      `les nouveaux -- n'invente jamais de nouveau style. Si la demande implique ` +
      `de retirer un élément ou une section entière, retire tout le bloc concerné ` +
      `proprement (balises ouvrantes et fermantes), sans laisser de fragment cassé.`,
    ``,
    `Demande de l'utilisateur : ${String(prompt).trim()}`,
    ``,
    `Réponds UNIQUEMENT avec le code HTML complet final, du <!DOCTYPE html> à la ` +
      `fermeture </html>. Pas de balises de code (pas de \`\`\`html), pas de ` +
      `commentaire ni d'explication avant ou après -- uniquement le HTML.`,
  ].join("\n");

  const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: instructions }] }],
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

  let newHtml: string | undefined =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!newHtml) {
    return NextResponse.json(
      {
        error:
          "Gemini n'a renvoyé aucun contenu pour cette demande (contenu peut-être filtré). Réessaie avec un autre prompt.",
      },
      { status: 502 }
    );
  }


  // creation du nouveu fichier HTML à partir de la réponse de Gemini. On retire les balises de code éventuelles et on vérifie que le HTML ressemble à une page complète.  

  // Gemini ignore parfois la consigne "pas de balises de code" -- on retire
  // une éventuelle enveloppe ```html ... ``` plutôt que de la sauvegarder
  // telle quelle dans le site.
  newHtml = newHtml.trim().replace(/^```(?:html)?\s*/i, "").replace(/```\s*$/i, "").trim();

  // Vérification volontairement légère (pas un vrai validateur HTML) : on
  // s'assure juste que ça ressemble à une page complète et que Gemini n'a
  // pas renvoyé un fragment tronqué. Ça n'empêche pas un dégât visuel subtil
  // (classe CSS oubliée...) -- voir le commentaire en tête de fichier sur ce
  // compromis, rattrapable en redemandant une correction dans le chat.
  const looksLikeFullPage =
    /<html[\s>]/i.test(newHtml) && /<\/html>/i.test(newHtml);

  if (!looksLikeFullPage) {
    return NextResponse.json(
      {
        error:
          "Gemini a renvoyé une réponse incomplète ou invalide. Réessaie, éventuellement avec une demande plus précise.",
      },
      { status: 502 }
    );
  }

  const { data: updated, error: updateError } = await supabaseForRequest
    .from("site")
    .update({ html: newHtml, updated_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select("id, html")
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ site: updated });
}
