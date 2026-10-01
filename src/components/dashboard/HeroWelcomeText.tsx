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
    // Sous `md`, ce bloc devient l'en-tête de la page (voir l'ordre flex dans
    // DashboardView.tsx) : aligné à gauche, titre réduit sur une ligne, avec
    // le nom de l'entreprise en surtitre puisque la sidebar qui l'affiche
    // est repliée. À partir de `md`, mêmes classes qu'avant.
    <div className="relative z-10 flex w-full flex-col items-start gap-1 pt-2 text-left max-md:-order-4 md:mt-16 md:items-center md:gap-4 md:pt-0 md:text-center">
      {entreprise ? (
        <p className="truncate font-label-sm text-label-sm uppercase text-primary max-w-full md:hidden">
          {entreprise.nom}
        </p>
      ) : null}
      <h1 className="flex max-w-[58rem] flex-wrap items-center justify-start gap-x-2 gap-y-2 font-display-lg text-[1.5rem] font-black leading-[1.02] tracking-[0.02em] text-on-surface md:justify-center md:gap-x-3 md:text-[clamp(1.85rem,4.5vw,3.35rem)]">
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
