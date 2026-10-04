"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { type SiteResume, listSitesDeLEntreprise } from "@/data/site";

interface UseSitesEntrepriseResult {
  /** Sites de l'entreprise (sans HTML), publiés d'abord ; vide tant que rien n'est chargé. */
  sites: SiteResume[];
  loading: boolean;
  /** Relit la liste (ex. en revenant à la galerie après une publication). */
  recharger: () => void;
}

/**
 * Les sites de l'entreprise sélectionnée, en une seule requête (voir
 * listSitesDeLEntreprise dans src/data/site.ts). Sert à la tuile « Site
 * web » du tableau de bord et aux badges « En ligne / Brouillon » de la
 * galerie des modèles.
 *
 * En cas d'erreur de lecture, on garde une liste vide plutôt qu'un message :
 * ces écrans n'ont pas de place pour une erreur, et la page du site, elle,
 * l'explique clairement.
 */
export function useSitesEntreprise(entrepriseId: string | null): UseSitesEntrepriseResult {
  const [sites, setSites] = useState<SiteResume[]>([]);
  const [loading, setLoading] = useState(!!entrepriseId);
  // Incrémenté par recharger() : relance l'effet sans changer d'entreprise.
  const [version, setVersion] = useState(0);

  // Remise à zéro PENDANT le rendu quand l'entreprise change (même technique
  // que useIdentiteVisuelle.ts) : évite un setState synchrone dans l'effet.
  const [prevEntrepriseId, setPrevEntrepriseId] = useState(entrepriseId);
  if (entrepriseId !== prevEntrepriseId) {
    setPrevEntrepriseId(entrepriseId);
    setLoading(!!entrepriseId);
    setSites([]);
  }

  useEffect(() => {
    if (!entrepriseId) return;
    let annule = false;
    listSitesDeLEntreprise(supabase, entrepriseId)
      .catch((): SiteResume[] => [])
      .then((liste) => {
        if (annule) return;
        setSites(liste);
        setLoading(false);
      });
    return () => {
      annule = true;
    };
  }, [entrepriseId, version]);

  const recharger = useCallback(() => setVersion((v) => v + 1), []);

  return {
    sites: entrepriseId ? sites : [],
    loading: entrepriseId ? loading : false,
    recharger,
  };
}
