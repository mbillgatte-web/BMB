import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Génération d'image via OpenRouter (pas Gemini en direct) -- voir
// OPENROUTER_IMAGE_MODEL dans .env.local. Gemini a été essayé en premier
// lors de l'écriture de cette route, mais son quota gratuit pour les
// modèles image est à 0 sur ce compte (visible dans le message d'erreur
// Google : "limit: 0") -- impossible d'en générer une seule sans activer la
// facturation sur le projet Google. OpenRouter facture à l'usage (quelques
// centimes par image, voir https://openrouter.ai/collections/image-models)
// mais contourne ce blocage. Changer de modèle (ex: passer sur un modèle
// OpenAI) ne demande de toucher qu'à OPENROUTER_IMAGE_MODEL, pas ce fichier.

const OPENROUTER_MODEL =
  process.env.OPENROUTER_IMAGE_MODEL || "google/gemini-3.1-flash-lite-image";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/images";

function mimeFromExt(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "OPENROUTER_API_KEY manquante. Ajoute-la dans .env.local (voir le commentaire au-dessus) puis redémarre le serveur.",
      },
      { status: 500 }
    );
  }

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

  // Contrairement à /api/identite-visuelle, cette route ne touche aucune
  // table protégée par RLS (qui aurait sinon rejeté gratuitement un jeton
  // invalide) -- chaque appel déclenche un vrai appel OpenRouter payant,
  // donc on vérifie nous-mêmes l'utilisateur avant de dépenser quoi que ce
  // soit.
  const {
    data: { user },
  } = await supabaseForRequest.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Utilisateur non authentifié" },
      { status: 401 }
    );
  }

  const {
    templateSrc, // chemin PUBLIC du modèle choisi, ex: "/visuels/flyer/xxx.jpg" (voir getVisuelsByCategory)
    prompt, // texte optionnel saisi par l'utilisateur
    formatName, // ex: "Flyer"
    formatDimensions, // ex: "210 × 297 mm"
    entrepriseNom,
    couleurPrimaire,
    couleurFond,
    couleurAccent,
    policeTitre,
    policeTexte,
    logoUrl,
  } = await request.json();

  if (!templateSrc || typeof templateSrc !== "string") {
    return NextResponse.json(
      { error: "Modèle de visuel manquant" },
      { status: 400 }
    );
  }

  // templateSrc vient du client : on s'assure qu'il ne peut désigner qu'un
  // fichier sous public/visuels/, jamais sortir de ce dossier.
  const visuelsDir = path.join(process.cwd(), "public", "visuels");
  const templatePath = path.join(
    process.cwd(),
    "public",
    path.normalize(templateSrc).replace(/^([/\\])+/, "")
  );
  if (
    !templatePath.startsWith(visuelsDir + path.sep) ||
    !fs.existsSync(templatePath)
  ) {
    return NextResponse.json(
      { error: "Modèle introuvable" },
      { status: 404 }
    );
  }

  const templateBuffer = fs.readFileSync(templatePath);
  const templateMime = mimeFromExt(templatePath);

  const identiteLines: string[] = [];
  if (entrepriseNom) identiteLines.push(`Nom de l'entreprise : ${entrepriseNom}`);
  if (couleurPrimaire || couleurFond || couleurAccent) {
    identiteLines.push(
      `Palette de couleurs à respecter strictement : ${[
        couleurPrimaire && `primaire ${couleurPrimaire}`,
        couleurFond && `fond ${couleurFond}`,
        couleurAccent && `accent ${couleurAccent}`,
      ]
        .filter(Boolean)
        .join(", ")}.`
    );
  }
  if (policeTitre || policeTexte) {
    identiteLines.push(
      `Style typographique à évoquer : titres façon "${
        policeTitre ?? "moderne"
      }", texte façon "${policeTexte ?? "moderne"}".`
    );
  }

  const instructions = [
    `Génère un visuel marketing au format "${formatName ?? "visuel"}"${
      formatDimensions ? ` (${formatDimensions})` : ""
    } pour l'entreprise ci-dessous.`,
    `Utilise la première image jointe comme référence de mise en page et de style graphique, mais recrée entièrement le visuel -- ne te contente pas de la recopier telle quelle.`,
    ...identiteLines,
    prompt?.trim()
      ? `Contenu à mettre en avant : ${prompt.trim()}`
      : `Aucun contenu précis fourni : imagine un texte d'accroche cohérent avec l'entreprise.`,
    `Le texte du visuel doit être en français, lisible, et sans faute d'orthographe.`,
  ].join("\n");

  // L'API Image d'OpenRouter (voir https://openrouter.ai/docs/guides/overview/multimodal/image-generation)
  // accepte jusqu'à 14 images de référence via input_references, chacune en
  // URL http(s) ou en data URL base64 -- contrairement à Gemini, pas de
  // distinction "inline_data" vs "text", tout est dans une seule liste.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputReferences: any[] = [
    {
      type: "image_url",
      image_url: {
        url: `data:${templateMime};base64,${templateBuffer.toString("base64")}`,
      },
    },
  ];

  if (logoUrl) {
    try {
      const logoRes = await fetch(logoUrl);
      if (logoRes.ok) {
        const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
        const logoMime = logoRes.headers.get("content-type") || "image/png";
        inputReferences.push({
          type: "image_url",
          image_url: { url: `data:${logoMime};base64,${logoBuffer.toString("base64")}` },
        });
      }
    } catch {
      // Le logo est un bonus pour la génération -- une erreur de
      // récupération ne doit pas bloquer tout le reste.
    }
  }

  const openRouterRes = await fetch(OPENROUTER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      prompt: instructions,
      input_references: inputReferences,
    }),
  });

  const openRouterData = await openRouterRes.json();

  if (!openRouterRes.ok) {
    // Remonte le message d'erreur brut d'OpenRouter : si OPENROUTER_IMAGE_MODEL
    // pointe vers un nom de modèle invalide, ou si le crédit du compte est
    // épuisé, l'erreur le dit explicitement -- pas la peine de deviner.
    return NextResponse.json(
      { error: openRouterData?.error?.message ?? "Erreur de l'API OpenRouter" },
      { status: openRouterRes.status }
    );
  }

  const image = openRouterData?.data?.[0];

  if (!image?.b64_json) {
    return NextResponse.json(
      {
        error:
          "OpenRouter n'a renvoyé aucune image pour cette demande (contenu peut-être filtré). Réessaie avec un autre prompt.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    imageDataUrl: `data:${image.media_type ?? "image/png"};base64,${image.b64_json}`,
  });
}
