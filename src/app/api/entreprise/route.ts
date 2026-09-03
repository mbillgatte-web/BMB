import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

  // On crée un client Supabase propre à CETTE requête (et pas le client
  // partagé de src/lib/supabaseClient.ts, qui lui n'a pas connaissance
  // de l'utilisateur). En lui passant le token dans ses headers, chaque
  // appel qu'il fait est exécuté "en tant que" cet utilisateur : c'est ce
  // qui fait que auth.uid() côté Postgres correspond bien à compteId.
  const supabaseForRequest = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: authHeader } } }
  );

  // insert simple : un compte peut posséder plusieurs entreprises, donc
  // chaque soumission de ce formulaire doit créer une NOUVELLE ligne (pas
  // de upsert/unique sur compte_id ici, contrairement à une version
  // précédente de ce fichier).
  const { data, error } = await supabaseForRequest
    .from("entreprise")
    .insert({
      nom: fullName,
      slogan: slogan,
      contact: phone,
      adresse: address,
      secteur_activite: secteur,
      compte_id: compteId,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entreprise: data });
}
