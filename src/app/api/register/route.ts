import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { creerCompte } from "@/data/compte";

export async function POST(request: NextRequest) {
  const { email, password , nom , prenom,  contact} = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email et mot de passe requis" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Le mot de passe doit contenir au moins 6 caractères" },
      { status: 400 }
    );
  }



// creation du user
// Client neuf pour CETTE requête : après signUp il porte la session du nouvel
// utilisateur, ce qui permet l'insert dans "compte" juste en dessous, sans
// risque de mélange avec une autre inscription simultanée.
  const supabase = createServerSupabase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });



  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }


  if (!data.user) {
    return NextResponse.json({ error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 });
  }

// creer simultaneement le compte du user

  try {
    await creerCompte(supabase, { id: data.user.id, nom, prenom, contact });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message },
       { status: 500 });
  }



  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}
