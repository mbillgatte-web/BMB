"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Entreprise {
  id: string;
  nom: string;
  slogan: string | null;
  secteur_activite: string | null;
  contact: string | null;
  adresse: string | null;
}

interface UseEntrepriseResult {
  entreprise: Entreprise | null;
  loading: boolean;
  error: string;
}

/**
 * Récupère l'entreprise du compte connecté, pour AFFICHAGE (ex: nom dans le
 * Hero du dashboard) — différent de useEntrepriseId.ts, qui sert au flux de
 * création (Palette -> Typographie -> Logo) et traite "aucune entreprise"
 * comme une erreur bloquante. Ici, `entreprise === null` est un état normal
 * (compte tout juste créé, pas encore d'entreprise).
 *
 * Si le compte a plusieurs entreprises, on affiche la plus récente en v1 —
 * pas encore de sélecteur multi-entreprises dans le dashboard.
 */
export function useEntreprise(): UseEntrepriseResult {
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setError("Vous devez être connecté.");
          setLoading(false);
        }
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("entreprise")
        .select("id, nom, slogan, secteur_activite, contact, adresse")
        .eq("compte_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(); // pas d'erreur si le compte n'a encore aucune entreprise

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setEntreprise(data ?? null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { entreprise, loading, error };
}
