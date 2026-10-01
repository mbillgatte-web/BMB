// Client Supabase du SERVEUR (routes API src/app/api/**).
// Contrairement au navigateur, le serveur traite les requêtes de TOUS les
// utilisateurs : un client partagé y mélangerait leurs sessions. On crée donc
// un client neuf à chaque requête, sans persistance de session.
import { createClient } from "@supabase/supabase-js";

/**
 * @param authHeader l'en-tête "Authorization: Bearer <token>" envoyé par le
 * navigateur. S'il est fourni, chaque requête du client est exécutée "en tant
 * que" cet utilisateur (auth.uid() côté Postgres, donc les policies RLS
 * s'appliquent). Sans lui, le client agit en anonyme.
 */
export function createServerSupabase(authHeader?: string | null) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: authHeader ? { headers: { Authorization: authHeader } } : undefined,
    }
  );
}
