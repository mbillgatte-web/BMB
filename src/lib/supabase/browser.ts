// Client Supabase du NAVIGATEUR (composants et hooks "use client").
// Un seul client partagé suffit ici : chaque navigateur n'a qu'un utilisateur
// connecté, et la session est mémorisée dans son localStorage.
// Ne JAMAIS l'importer dans une route API (src/app/api/**) : côté serveur,
// utiliser createServerSupabase() de ./server.ts.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
