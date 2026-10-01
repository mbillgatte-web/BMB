import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { creerEntreprise } from "@/data/entreprise";

export async function POST(request: NextRequest) {
  // Ce que le navigateur envoie (voir EntrepriseForm.tsx -> body du fetch).
  const {
    fullName,
    slogan,
    phone,
    address,
    secteur,
    compteId,
  } = await request.json();

  if (!fullName || !compteId) {
    return NextResponse.json({ error: "Nom de l'entreprise requis" }, { status: 400 });
  }

  // Le jeton d'accès de l'utilisateur connecté, envoyé par EntrepriseForm.tsx
  // dans l'en-tête Authorization. Sans lui, Supabase ne sait pas qui appelle
  // et la policy RLS (auth.uid() = compte_id) rejette l'insertion.
  const authHeader = request.headers.get("Authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Utilisateur non authentifié" },
      { status: 401 }
    );
  }

  try {
    const entreprise = await creerEntreprise(createServerSupabase(authHeader), {
      nom: fullName,
      slogan,
      contact: phone,
      adresse: address,
      secteurActivite: secteur,
      compteId,
    });
    return NextResponse.json({ entreprise });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
