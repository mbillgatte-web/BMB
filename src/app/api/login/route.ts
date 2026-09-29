import { NextRequest, NextResponse } from 'next/server'

import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email et mot de passe requis' },
      { status: 400 }
    )
  }

  // Client neuf pour CETTE requête : un client partagé garderait en mémoire la
  // session du dernier utilisateur connecté, pour tous les autres.
  const supabase = createServerSupabase()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 })
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  })
}