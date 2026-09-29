"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/browser";
import { type Entreprise, listEntreprisesDuCompte } from "@/data/entreprise";

interface UseEntrepriseResult {
  entreprise: Entreprise | null;
  entreprises: Entreprise[];
  selectEntreprise: (id: string) => void;
  loading: boolean;
  error: string;
}

const STORAGE_KEY = "selectedEntrepriseId";
// Nom de l'événement custom qu'on déclenche nous-mêmes : contrairement à
// l'événement natif "storage", il se déclenche aussi dans l'onglet qui a
// fait le changement (pas seulement les autres onglets) -- indispensable
// pour que Sidebar et HeroSection se resynchronisent entre eux.
const SYNC_EVENT = "entreprise-selection-changed";

/**
 * Récupère toutes les entreprises du compte connecté, et garde en mémoire
 * laquelle est actuellement "sélectionnée" (persistée dans localStorage,
 * synchronisée entre tous les composants qui appellent ce hook).
 */
export function useEntreprise(): UseEntrepriseResult {
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Vous devez être connecté.");
      setLoading(false);
      return;
    }

    let list: Entreprise[];
    try {
      list = await listEntreprisesDuCompte(supabase, user.id);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return;
    }

    setEntreprises(list);

    // Priorité à ce qui est mémorisé dans localStorage, seulement s'il
    // correspond encore à une entreprise existante ; sinon la plus récente.
    const stored = localStorage.getItem(STORAGE_KEY);
    const stillValid = list.some((e) => e.id === stored);
    setSelectedId(stillValid ? stored : (list[0]?.id ?? null));

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    // Un autre composant (ex: le sélecteur de la Sidebar) a changé la
    // sélection : on relit juste localStorage, pas besoin de refaire la
    // requête réseau, la liste des entreprises n'a pas changé.
    const syncSelection = () => {
      setSelectedId(localStorage.getItem(STORAGE_KEY));
    };
    window.addEventListener(SYNC_EVENT, syncSelection);
    return () => window.removeEventListener(SYNC_EVENT, syncSelection);
  }, []);

  const selectEntreprise = (id: string) => {
    localStorage.setItem(STORAGE_KEY, id);
    setSelectedId(id);
    window.dispatchEvent(new Event(SYNC_EVENT));
  };

  const entreprise = entreprises.find((e) => e.id === selectedId) ?? null;

  return { entreprise, entreprises, selectEntreprise, loading, error };
}
