"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface IdentiteVisuelle {
  id: string;
  entreprise_id: string;
  palette_mode: string | null;
  couleur_primaire: string | null;
  couleur_fond: string | null;
  couleur_accent: string | null;
  police_titre: string | null;
  police_texte: string | null;
  logo_url: string | null;
}

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
      const { data, error: fetchError } = await supabase
        .from("identite_visuelle")
        .select(
          "id, entreprise_id, palette_mode, couleur_primaire, couleur_fond, couleur_accent, police_titre, police_texte, logo_url"
        )
        .eq("entreprise_id", entrepriseId)
        .maybeSingle(); // pas d'erreur si rien n'existe encore pour cette entreprise

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setIdentiteVisuelle(data ?? null);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [entrepriseId]);

  return { identiteVisuelle, loading, error };
}
