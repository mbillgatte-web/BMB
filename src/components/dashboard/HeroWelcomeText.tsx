"use client";

import { useEntreprise } from "@/hooks/useEntreprise";
import { TextRotate } from "./TextRotate";

// Texte central de la hero section (voir DashboardView.tsx) : nom de
// l'entreprise + message de bienvenue, au-dessus du fond animé
// (HeroFluidBackground) et des tuiles KPI. Repris du contenu de
// HeroSection.tsx (aujourd'hui inutilisé) mais sans ses boutons -- la
// demande porte uniquement sur un texte central, les KPI en dessous
// remplissent déjà le rôle d'appel à l'action.
export default function HeroWelcomeText() {
  const { entreprise } = useEntreprise();

  return (
    <div className="relative z-10 mt-12 flex w-full flex-col items-center gap-4 text-center sm:mt-16">
      <h1 className="flex max-w-[58rem] flex-wrap items-center justify-center gap-x-3 gap-y-2 font-display-lg text-[clamp(1.85rem,4.5vw,3.35rem)] font-black  leading-[1.02] tracking-[0.02em] text-on-surface">
        <span>Créer votre</span>
        <span className="inline-flex min-h-[1.15em] max-w-full items-center overflow-hidden rounded-xl bg-primary px-3 py-1.5 text-white shadow-[0_14px_28px_-16px_rgba(70,72,212,0.85)] sm:px-5 sm:py-2">
            <TextRotate
              texts={[" entreprise", " visuels", " Site web", " Identité", " Marque"  ]}
              mainClassName="max-w-full justify-center text-white"
              elementLevelClassName="will-change-transform text-white"
            />
        </span>
       . 
      </h1>
  
    </div>
  );
}
