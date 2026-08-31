import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  // Ce que LogoBuilder.tsx envoie (voir son handleFinish -> body du fetch).
  const {
    entrepriseId,      // -> colonne "entreprise_id" (clé étrangère vers entreprise.id)
    paletteMode,       // -> colonne "palette_mode"
    couleurPrimaire,   // -> colonne "couleur_primaire"
    couleurFond,       // -> colonne "couleur_fond"
    couleurAccent,     // -> colonne "couleur_accent"
    policeTitre,       // -> colonne "police_titre"
    policeTexte,       // -> colonne "police_texte"
    logoUrl,           // -> colonne "logo_url"
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
  // accepte l'insertion.
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Utilisateur non authentifié" },
      { status: 401 }
    );
  }

  // Client Supabase authentifié pour cette requête précise (voir
  // /api/entreprise/route.ts pour l'explication détaillée de ce pattern).
  const supabaseForRequest = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data, error } = await supabaseForRequest
    .from("identite_visuelle")
    .insert({
      entreprise_id: entrepriseId,
      palette_mode: paletteMode,
      couleur_primaire: couleurPrimaire,
      couleur_fond: couleurFond,
      couleur_accent: couleurAccent,
      police_titre: policeTitre,
      police_texte: policeTexte,
      logo_url: logoUrl,
    })
    .select()
    .single();

  if (error) {
    // "column ... does not exist" -> nom de colonne à gauche du insert à corriger.
    // "row-level security policy" -> vérifie que la policy compare bien
    // entreprise.compte_id (via une jointure) et pas identite_visuelle.compte_id
    // (cette table n'a pas de compte_id, seulement entreprise_id).
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ identiteVisuelle: data });
}
