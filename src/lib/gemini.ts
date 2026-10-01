// Appel texte à Gemini (Google AI Studio), côté serveur uniquement.
// Même modèle et même clé que /api/edit-site : GEMINI_TEXT_MODEL et
// GEMINI_API_KEY dans .env.local.

const GEMINI_MODEL = process.env.GEMINI_TEXT_MODEL || "gemini-3.6-flash";

// Modèles essayés si le principal reste surchargé, dans l'ordre. Réglable
// dans .env.local (noms séparés par des virgules). Par défaut : un Flash
// stable de la génération précédente d'abord (moins demandé, donc rarement
// saturé en même temps que le plus récent), puis l'alias "gemini-flash-latest"
// (qui pointe souvent vers le même modèle que le principal).
const MODELES_SECOURS = (
  process.env.GEMINI_TEXT_FALLBACK_MODELS || "gemini-2.5-flash,gemini-flash-latest"
)
  .split(",")
  .map((m) => m.trim())
  .filter((m) => m && m !== GEMINI_MODEL);

// Erreurs passagères côté Google : surcharge (503), quota momentané (429),
// erreur interne (500). Elles valent la peine d'être retentées.
const STATUTS_PASSAGERS = new Set([429, 500, 503]);
const ATTENTES_MS = [2000, 5000];

// Longueur maximale de la réponse (en tokens). Une page HTML complète est
// longue : avec la valeur par défaut de Google, elle peut être coupée net.
const MAX_TOKENS_REPONSE = 65536;

/** Erreur Gemini avec le code HTTP à renvoyer au navigateur. */
export class GeminiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

type Options = {
  /** Demande une réponse au format JSON (responseMimeType application/json). */
  json?: boolean;
};

const attendre = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function appeler(modele: string, apiKey: string, instructions: string, options: Options) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modele}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: instructions }] }],
        generationConfig: {
          maxOutputTokens: MAX_TOKENS_REPONSE,
          ...(options.json ? { responseMimeType: "application/json" } : {}),
        },
      }),
    }
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data: any = await res.json().catch(() => ({}));
  return { res, data };
}

/**
 * Envoie des instructions texte à Gemini et renvoie sa réponse brute.
 * En cas de surcharge passagère : quelques nouvelles tentatives espacées sur
 * le modèle principal, puis les modèles de secours.
 */
export async function genererTexte(
  instructions: string,
  etiquetteLog: string,
  options: Options = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError(
      "GEMINI_API_KEY manquante. Ajoute-la dans .env.local puis redémarre le serveur.",
      500
    );
  }

  const essais = [
    ...[0, ...ATTENTES_MS].map((attente) => ({ modele: GEMINI_MODEL, attente })),
    ...MODELES_SECOURS.map((modele) => ({ modele, attente: 0 })),
  ];

  let dernier: { res: Response; data: any } | null = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  let principalSurcharge = false;
  // 429 = quota de la clé (requêtes par minute ou par jour) : ce n'est pas
  // une surcharge de Google, et réessayer tout de suite ne sert à rien.
  let quotaAtteint = false;

  for (const { modele, attente } of essais) {
    if (attente) await attendre(attente);
    dernier = await appeler(modele, apiKey, instructions, options);

    if (dernier.res.ok) break;
    if (dernier.res.status === 429) quotaAtteint = true;
    if (modele === GEMINI_MODEL && STATUTS_PASSAGERS.has(dernier.res.status)) principalSurcharge = true;

    console.error(
      `[${etiquetteLog}] Erreur Gemini (${modele}, ${dernier.res.status}) :`,
      JSON.stringify(dernier.data?.error ?? dernier.data)
    );
    // Erreur non passagère (clé invalide, requête refusée...) : inutile d'insister.
    if (!STATUTS_PASSAGERS.has(dernier.res.status) && modele === GEMINI_MODEL) break;
  }

  const { res, data } = dernier!;

  if (!res.ok) {
    if (quotaAtteint) {
      throw new GeminiError(
        "Le quota de l'API Gemini est atteint pour le moment (limite de requêtes par minute ou par jour de la clé). Réessayez dans quelques minutes ; si cela persiste, vérifiez le quota de la clé dans Google AI Studio.",
        429
      );
    }
    // Le modèle principal était surchargé : c'est le vrai problème, même si
    // un modèle de secours a ensuite échoué pour une autre raison.
    if (principalSurcharge || STATUTS_PASSAGERS.has(res.status)) {
      throw new GeminiError(
        "Le service d'IA est très sollicité en ce moment. Patientez quelques instants puis réessayez.",
        503
      );
    }
    throw new GeminiError(data?.error?.message ?? "Erreur de l'API Gemini", res.status);
  }

  const candidat = data?.candidates?.[0];

  if (candidat?.finishReason === "MAX_TOKENS") {
    console.error(`[${etiquetteLog}] Réponse coupée (MAX_TOKENS).`);
    throw new GeminiError(
      "La réponse de l'IA a été coupée car elle était trop longue. Demandez un site plus simple ou réessayez.",
      502
    );
  }

  const texte: string | undefined = candidat?.content?.parts
    ?.map((p: { text?: string }) => p.text ?? "")
    .join("");

  if (!texte) {
    // "finishReason" (ex: "SAFETY") explique pourquoi il n'y a pas de texte.
    console.error(`[${etiquetteLog}] Gemini n'a renvoyé aucun texte :`, JSON.stringify(data, null, 2));
    throw new GeminiError(
      "L'IA n'a renvoyé aucun contenu pour cette demande (contenu peut-être filtré). Reformulez et réessayez.",
      502
    );
  }

  return texte;
}

/**
 * Sépare la réponse attendue « RÉSUMÉ : ... » + page HTML complète.
 * Renvoie null si la réponse ne contient pas une page HTML complète
 * (réponse tronquée, texte d'explication à la place du code...).
 */
export function extraireResumeEtHtml(reponse: string): { resume: string; html: string } | null {
  // Gemini ignore parfois la consigne "pas de balises de code".
  const texte = reponse.replace(/```(?:html)?/gi, "").trim();

  const debut = texte.search(/<!DOCTYPE html|<html[\s>]/i);
  if (debut === -1) return null;

  const fin = texte.search(/<\/html>/i);
  if (fin === -1 || fin < debut) return null;

  const html = texte.slice(debut, fin + "</html>".length).trim();
  const resume = texte
    .slice(0, debut)
    .replace(/^\s*R[ÉE]SUM[ÉE]\s*:\s*/i, "")
    .trim();

  return { resume, html };
}

/** Lit une réponse JSON de Gemini (tolère une enveloppe ```json ... ```). */
export function lireJson<T>(reponse: string): T | null {
  const texte = reponse.replace(/^\s*```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  try {
    return JSON.parse(texte) as T;
  } catch {
    return null;
  }
}
