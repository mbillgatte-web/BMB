"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { type IdentiteVisuelle, getIdentiteVisuelle } from "@/data/identiteVisuelle";

interface UseIdentiteVisuelleResult {
  identiteVisuelle: IdentiteVisuelle | null;
  loading: boolean;
  error: string;
}

/**
 * Récupère l'identité visuelle déjà enregistrée pour une entreprise donnée
 * (palette, typographie, logo), pour PRÉREMPLIR PaletteBuilder / police.tsx /
 * LogoBuilder quand on revisite la configuration d'une entreprise qui en a
 * déjà une -- au lieu de toujours repartir des valeurs par défaut.
 *
 * `identiteVisuelle === null` est un état normal tant que rien n'a encore
 * été enregistré pour cette entreprise (première configuration).
 */
export function useIdentiteVisuelle(
  entrepriseId: string | null
): UseIdentiteVisuelleResult {
  const [identiteVisuelle, setIdentiteVisuelle] =
    useState<IdentiteVisuelle | null>(null);
  const [loading, setLoading] = useState(!!entrepriseId);
  const [error, setError] = useState("");

  // Technique de rendu (pas d'effet) : dès que entrepriseId change, on
  // remet loading/identiteVisuelle à zéro immédiatement pendant le rendu,
  // avant même que l'effet de récupération ci-dessous ne parte. Évite tout
  // setState synchrone dans le corps de l'effet (voir Sidebar.tsx pour la
  // même technique, et pourquoi : https://react.dev/learn/you-might-not-need-an-effect).
  const [prevEntrepriseId, setPrevEntrepriseId] = useState(entrepriseId);
  if (entrepriseId !== prevEntrepriseId) {
    setPrevEntrepriseId(entrepriseId);
    setLoading(!!entrepriseId);
    setIdentiteVisuelle(null);
    setError("");
  }

  useEffect(() => {
    if (!entrepriseId) return;

    let cancelled = false;

    (async () => {
      try {
        const data = await getIdentiteVisuelle(supabase, entrepriseId);
        if (!cancelled) setIdentiteVisuelle(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [entrepriseId]);

  return { identiteVisuelle, loading, error };
}
