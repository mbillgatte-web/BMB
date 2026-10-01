"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { compterProjetsActifs } from "@/data/projet";

interface UseProjetsActifsResult {
  /** Nombre de projets « idée » ou « en cours » ; 0 tant que rien n'est chargé. */
  nombre: number;
  loading: boolean;
}

/**
 * Compteur « Projets actifs » du tableau de bord pour l'entreprise
 * sélectionnée (voir compterProjetsActifs dans src/data/projet.ts).
 *
 * En cas d'erreur de lecture (ex. table `projet` pas encore créée en base),
 * on affiche 0 plutôt qu'un message : la tuile du tableau de bord n'a pas de
 * place pour une erreur, et la page /Projets, elle, l'explique clairement.
 */
export function useProjetsActifs(entrepriseId: string | null): UseProjetsActifsResult {
  const [nombre, setNombre] = useState(0);
  const [loading, setLoading] = useState(!!entrepriseId);

  // Remise à zéro PENDANT le rendu quand l'entreprise change (même technique
  // que useIdentiteVisuelle.ts) : évite un setState synchrone dans l'effet.
  const [prevEntrepriseId, setPrevEntrepriseId] = useState(entrepriseId);
  if (entrepriseId !== prevEntrepriseId) {
    setPrevEntrepriseId(entrepriseId);
    setLoading(!!entrepriseId);
    setNombre(0);
  }

  useEffect(() => {
    if (!entrepriseId) return;
    let annule = false;
    compterProjetsActifs(supabase, entrepriseId)
      .catch(() => 0)
      .then((n) => {
        if (annule) return;
        setNombre(n);
        setLoading(false);
      });
    return () => {
      annule = true;
    };
  }, [entrepriseId]);

  return { nombre: entrepriseId ? nombre : 0, loading: entrepriseId ? loading : false };
}
