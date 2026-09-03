"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface UseEntrepriseIdResult {
  entrepriseId: string | null;
  loading: boolean;
  error: string;
}

/**
 * Résout l'id de l'entreprise à utiliser sur cette page.
 *
 * Un compte peut avoir PLUSIEURS entreprises, donc on ne peut pas toujours
 * deviner laquelle. Deux sources, dans cet ordre :
 *
 * 1. L'URL (?entrepriseId=xxx) si elle est présente : cas normal en sortie
 *    de EntrepriseForm.tsx (qui vient de créer/identifier une entreprise
 *    précise) ou de navigation entre /PaletteColor -> /Typographie -> /Logo.
 * 2. À défaut, on regarde combien d'entreprises le compte connecté possède :
 *    une seule -> on l'ouvre directement (comportement par défaut demandé) ;
 *    zéro ou plusieurs -> on ne peut pas deviner, on renvoie une erreur.
 */
export function useEntrepriseId(): UseEntrepriseIdResult {
  const searchParams = useSearchParams();
  // Disponible dès le rendu (useSearchParams n'est pas asynchrone) : pas
  // besoin d'un effet pour ce cas, on le dérive directement plus bas.
  const urlEntrepriseId = searchParams.get("entrepriseId");

  // Ce state ne sert QUE pour le cas 2 (détection via la BD, réellement
  // asynchrone). Quand l'URL suffit, il reste à null et n'est pas utilisé.
  const [detectedId, setDetectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(!urlEntrepriseId);
  const [error, setError] = useState("");

  useEffect(() => {
    // L'URL donne déjà une réponse précise : rien à faire ici, la valeur
    // finale est calculée plus bas directement à partir de urlEntrepriseId.
    if (urlEntrepriseId) return;

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

      // La policy RLS "select" ne renvoie de toute façon que les lignes de
      // ce compte ; le .eq() est surtout là pour la lisibilité.
      const { data, error: fetchError } = await supabase
        .from("entreprise")
        .select("id")
        .eq("compte_id", user.id);

      if (cancelled) return;

      if (fetchError) {
        setError(fetchError.message);
      } else if (!data || data.length === 0) {
        setError(
          "Aucune entreprise trouvée pour ce compte. Crée-en une d'abord."
        );
      } else if (data.length === 1) {
        // Cas par défaut demandé : une seule entreprise -> on l'ouvre.
        setDetectedId(data[0].id);
      } else {
        // Plusieurs entreprises et aucun id dans l'URL : impossible de
        // deviner laquelle sans un sélecteur dédié (pas encore construit).
        setError(
          "Plusieurs entreprises trouvées pour ce compte : précise laquelle depuis le tableau de bord."
        );
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [urlEntrepriseId]);

  // L'URL a toujours priorité quand elle est présente (voir le early return
  // ci-dessus) ; sinon on retombe sur ce que la détection en BD a trouvé.
  return urlEntrepriseId
    ? { entrepriseId: urlEntrepriseId, loading: false, error: "" }
    : { entrepriseId: detectedId, loading, error };
}
