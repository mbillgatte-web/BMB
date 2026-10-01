import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { GeminiError, extraireResumeEtHtml, genererTexte, lireJson } from "@/lib/gemini";
import {
  contexteEntreprise,
  promptCreation,
  promptModification,
  type ReponseModification,
} from "@/lib/promptSiteIA";
import { getEntreprise } from "@/data/entreprise";
import { getIdentiteVisuelle } from "@/data/identiteVisuelle";
import {
  SITE_IA_ID,
  creerSite,
  getSite,
  mettreAJourSite,
  messagesDuSiteIA,
  type MessageSiteIA,
} from "@/data/site";

// Générer une page complète peut prendre plus d'une minute.
export const maxDuration = 180;

// Nombre de demandes précédentes rappelées à l'IA lors d'une modification,
// pour qu'elle garde le fil sans recevoir tout l'historique.
const HISTORIQUE_RAPPELE = 6;

const estPageComplete = (html: string) => /<html[\s>]/i.test(html) && /<\/html>\s*$/i.test(html.trim());

/**
 * Applique les remplacements ciblés proposés par l'IA au HTML actuel.
 * Chaque extrait doit être trouvé tel quel ; ceux qui ne le sont pas sont
 * ignorés (et comptés), pour ne jamais casser la page.
 */
function appliquerModifications(
  html: string,
  modifications: NonNullable<ReponseModification["modifications"]>
): { html: string; appliquees: number; ignorees: number } {
  let resultat = html;
  let appliquees = 0;
  let ignorees = 0;

  for (const { rechercher, remplacer } of modifications) {
    if (typeof rechercher !== "string" || typeof remplacer !== "string" || !rechercher) {
      ignorees++;
      continue;
    }
    const position = resultat.indexOf(rechercher);
    if (position === -1) {
      ignorees++;
      continue;
    }
    resultat = resultat.slice(0, position) + remplacer + resultat.slice(position + rechercher.length);
    appliquees++;
  }

  return { html: resultat, appliquees, ignorees };
}

/**
 * POST /api/generate-site — création d'un site par conversation avec l'IA,
 * sans partir d'un template (voir SiteChatBuilder.tsx).
 *
 * - Premier message (ou `recommencer: true`) : l'IA crée la page complète à
 *   partir des infos de l'entreprise, de son identité visuelle et de la
 *   demande (voir lib/promptSiteIA.ts).
 * - Messages suivants : l'IA renvoie des remplacements ciblés, appliqués au
 *   HTML existant. Plus rapide et impossible à "couper" en cours de route,
 *   contrairement à une réécriture de toute la page.
 *
 * Le site est rangé dans la table "site" (template_id = SITE_IA_ID) : la page
 * dans la colonne `html`, la conversation dans la colonne `content`.
 */
export async function POST(request: NextRequest) {
  const { entrepriseId, prompt, imageUrl, recommencer } = await request.json();

  const demande = typeof prompt === "string" ? prompt.trim() : "";
  if (!entrepriseId) {
    return NextResponse.json({ error: "Entreprise requise" }, { status: 400 });
  }
  if (!demande) {
    return NextResponse.json({ error: "Décrivez le site que vous voulez." }, { status: 400 });
  }

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
  }

  const supabase = createServerSupabase(authHeader);
  const image = typeof imageUrl === "string" && imageUrl.trim() ? imageUrl.trim() : null;

  try {
    // RLS : ne renvoie l'entreprise que si elle appartient à l'utilisateur.
    const entreprise = await getEntreprise(supabase, entrepriseId);
    if (!entreprise) {
      return NextResponse.json({ error: "Entreprise introuvable." }, { status: 404 });
    }

    const [identite, existant] = await Promise.all([
      getIdentiteVisuelle(supabase, entrepriseId).catch(() => null),
      getSite(supabase, entrepriseId, SITE_IA_ID),
    ]);

    const historique = recommencer ? [] : messagesDuSiteIA(existant);
    const modification = Boolean(existant?.html) && !recommencer;
    const contexte = contexteEntreprise(entreprise, identite);

    console.log(
      `[generate-site] entreprise=${entrepriseId} mode=${modification ? "modification" : "creation"} prompt="${demande}"`
    );

    let nouveauHtml: string;
    let resume: string;

    if (modification) {
      const precedentes = historique
        .filter((m) => m.role === "user")
        .slice(-HISTORIQUE_RAPPELE)
        .map((m) => m.text);

      const brut = await genererTexte(
        promptModification(contexte, existant!.html!, precedentes, demande, image),
        "generate-site",
        { json: true }
      );
      const reponse = lireJson<ReponseModification>(brut);

      if (!reponse) {
        console.error("[generate-site] Réponse JSON illisible :\n", brut.slice(0, 2000));
        return NextResponse.json(
          { error: "L'IA a renvoyé une réponse illisible. Réessayez, éventuellement en reformulant." },
          { status: 502 }
        );
      }

      if (reponse.html && estPageComplete(reponse.html)) {
        // Refonte complète demandée.
        nouveauHtml = reponse.html.trim();
      } else {
        const { html, appliquees, ignorees } = appliquerModifications(
          existant!.html!,
          reponse.modifications ?? []
        );
        console.log(`[generate-site] modifications appliquées=${appliquees} ignorées=${ignorees}`);

        if (appliquees === 0) {
          return NextResponse.json(
            {
              error:
                "L'IA n'a pas réussi à appliquer ce changement au site. Réessayez en précisant la partie à modifier (ex. « le titre du haut », « la section contact »).",
            },
            { status: 502 }
          );
        }
        nouveauHtml = html;
      }

      resume = reponse.resume?.trim() || "C'est fait, votre site a été mis à jour.";
    } else {
      const brut = await genererTexte(promptCreation(contexte, demande, image), "generate-site");
      const resultat = extraireResumeEtHtml(brut);

      if (!resultat) {
        console.error("[generate-site] Réponse sans page HTML complète :\n", brut.slice(0, 2000));
        return NextResponse.json(
          { error: "L'IA a renvoyé une page incomplète. Réessayez, éventuellement avec une demande plus précise." },
          { status: 502 }
        );
      }

      nouveauHtml = resultat.html;
      resume = resultat.resume || "Votre site est prêt.";
    }

    const messages: MessageSiteIA[] = [
      ...historique,
      { role: "user", text: demande, ...(image ? { imageUrl: image } : {}) },
      { role: "assistant", text: resume },
    ];

    const site = existant
      ? await mettreAJourSite(supabase, existant.id, { html: nouveauHtml, content: { messages } })
      : await creerSite(supabase, {
          entrepriseId,
          templateId: SITE_IA_ID,
          content: { messages },
          html: nouveauHtml,
        });

    return NextResponse.json({ messages, siteId: site.id });
  } catch (err) {
    const status = err instanceof GeminiError ? err.status : 500;
    return NextResponse.json({ error: (err as Error).message }, { status });
  }
}
