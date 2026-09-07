import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Modèle configurable sans toucher au code : voir GEMINI_IMAGE_MODEL dans
// .env.local. gemini-3.1-flash-image est celui recommandé par Google au
// moment où ce fichier a été écrit -- si Google en change le nom, changer
// la variable d'env suffit, pas la peine de retoucher cette route.
const GEMINI_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-image";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function mimeFromExt(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/jpeg";
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "GEMINI_API_KEY manquante. Ajoute-la dans .env.local (voir le commentaire au-dessus) puis redémarre le serveur.",
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
  // invalide) -- chaque appel déclenche un vrai appel Gemini payant, donc
  // on vérifie nous-mêmes l'utilisateur avant de dépenser quoi que ce soit.
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
    `Utilise l'image jointe comme référence de mise en page et de style graphique, mais recrée entièrement le visuel -- ne te contente pas de la recopier telle quelle.`,
    ...identiteLines,
    prompt?.trim()
      ? `Contenu à mettre en avant : ${prompt.trim()}`
      : `Aucun contenu précis fourni : imagine un texte d'accroche cohérent avec l'entreprise.`,
    `Le texte du visuel doit être en français, lisible, et sans faute d'orthographe.`,
  ].join("\n");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [
    { text: instructions },
    { inline_data: { mime_type: templateMime, data: templateBuffer.toString("base64") } },
  ];

  if (logoUrl) {
    try {
      const logoRes = await fetch(logoUrl);
      if (logoRes.ok) {
        const logoBuffer = Buffer.from(await logoRes.arrayBuffer());
        parts.push({ text: "Voici le logo exact de l'entreprise à intégrer au visuel :" });
        parts.push({
          inline_data: {
            mime_type: logoRes.headers.get("content-type") || "image/png",
            data: logoBuffer.toString("base64"),
          },
        });
      }
    } catch {
      // Le logo est un bonus pour la génération -- une erreur de
      // récupération ne doit pas bloquer tout le reste.
    }
  }

  const geminiRes = await fetch(GEMINI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({ contents: [{ parts }] }),
  });

  const geminiData = await geminiRes.json();

  if (!geminiRes.ok) {
    // Remonte le message d'erreur brut de Google : si GEMINI_IMAGE_MODEL
    // pointe vers un nom de modèle invalide ou déprécié, l'erreur le dit
    // explicitement ("model not found" etc.) -- pas la peine de deviner.
    return NextResponse.json(
      { error: geminiData?.error?.message ?? "Erreur de l'API Gemini" },
      { status: geminiRes.status }
    );
  }

  const imagePart = geminiData?.candidates?.[0]?.content?.parts?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (p: any) => p.inlineData || p.inline_data
  );
  const inline = imagePart?.inlineData ?? imagePart?.inline_data;

  if (!inline?.data) {
    return NextResponse.json(
      {
        error:
          "Gemini n'a renvoyé aucune image pour cette demande (contenu peut-être filtré). Réessaie avec un autre prompt.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({
    imageDataUrl: `data:${inline.mimeType ?? inline.mime_type ?? "image/png"};base64,${inline.data}`,
  });
}
