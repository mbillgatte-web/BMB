"use client";

import { Folder } from "lucide-react";
import { useEntreprise } from "@/hooks/useEntreprise";

// Deuxième tuile de la ligne KPI (voir DashboardView.tsx), même traitement
// visuel sobre que BrandIdentityShowcase. "Projets actifs" = nombre
// d'entreprises du compte connecté (useEntreprise renvoie déjà la liste
// complète pour le sélecteur -- pas de notion de statut "actif/inactif" sur
// la table "entreprise" à ce jour, donc on compte tout ce que le compte a
// créé, cohérent avec ce que /dashboard peut afficher sans inventer une
// donnée qui n'existe pas encore).
export default function ActiveProjectsKpi() {
  const { entreprises, loading } = useEntreprise();

  if (loading) {
    return (
      <div className="h-[84px] animate-pulse rounded-xl border border-outline-variant bg-surface-container-lowest" />
    );
  }

  return (
    <div className="flex items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary-container/30 text-secondary">
        <Folder className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-label-sm text-label-sm text-on-surface-variant">Projets actifs</p>
        <p className="font-mono-stats text-mono-stats leading-none text-on-surface">
          {entreprises.length}
        </p>
      </div>
    </div>
  );
}
