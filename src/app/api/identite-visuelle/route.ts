import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { enregistrerIdentiteVisuelle } from "@/data/identiteVisuelle";

export async function POST(request: NextRequest) {
  // Ce que LogoBuilder.tsx envoie (voir son handleFinish -> body du fetch).
  const {
    entrepriseId,
    paletteMode,
    couleurPrimaire,
    couleurFond,
    couleurAccent,
    policeTitre,
    policeTexte,
    logoUrl,
  } = await request.json();

  if (!entrepriseId) {
    return NextResponse.json(
      { error: "Entreprise requise" },
      { status: 400 }
    );
  }

  // Même mécanisme que /api/entreprise : le jeton de l'utilisateur connecté,
  // envoyé par LogoBuilder.tsx dans l'en-tête Authorization. Nécessaire pour
  // que la policy RLS de identite_visuelle (qui vérifie via entreprise.compte_id)
  // accepte l'enregistrement.
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Utilisateur non authentifié" },
      { status: 401 }
    );
  }

  try {
    const identiteVisuelle = await enregistrerIdentiteVisuelle(
      createServerSupabase(authHeader),
      {
        entrepriseId,
        paletteMode,
        couleurPrimaire,
        couleurFond,
        couleurAccent,
        policeTitre,
        policeTexte,
        logoUrl,
      }
    );
    return NextResponse.json({ identiteVisuelle });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
