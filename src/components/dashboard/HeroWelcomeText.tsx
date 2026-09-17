"use client";

import { useEntreprise } from "@/hooks/useEntreprise";

// Texte central de la hero section (voir DashboardView.tsx) : nom de
// l'entreprise + message de bienvenue, au-dessus du fond animé
// (HeroFluidBackground) et des tuiles KPI. Repris du contenu de
// HeroSection.tsx (aujourd'hui inutilisé) mais sans ses boutons -- la
// demande porte uniquement sur un texte central, les KPI en dessous
// remplissent déjà le rôle d'appel à l'action.
export default function HeroWelcomeText() {
  const { entreprise } = useEntreprise();

  return (
    <div className="relative z-10 flex w-full flex-col items-center gap-3 text-center">
      
      <h1 className="font-display-lg text-[clamp(1.75rem,4vw,2.5rem)] leading-tight text-on-surface">
        BIENVENUE DANS VOTRE ENTREPRISE.
      </h1>
      {/* max-w-xl est cassé dans ce projet (voir la note dans
          tailwind.config.ts : spacing.xl écrase silencieusement
          maxWidth.xl) -- valeur arbitraire à la place, même contournement
          que VisualGenerator.tsx. */}
      <p className="mx-auto max-w-[32rem] font-body-md text-body-md text-on-surface-variant">
        {entreprise?.slogan ||
          "Suivez l'avancement de votre projet et pilotez votre identité de marque."}
      </p>
    </div>
  );
}
