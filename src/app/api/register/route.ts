import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(request: NextRequest) {
  const { email, password , name , prenom,  contact} = await request.json();

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

  const { error:  profileError } = await supabase.from("compte").insert({
      id: data.user.id , 
      name, 
      prenom, 
      contact,
  });


  if (profileError) {
    return NextResponse.json({ error: profileError.message },
       { status: 500 });
  }



  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}