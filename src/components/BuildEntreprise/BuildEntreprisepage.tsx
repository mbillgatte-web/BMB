"use client";

import React from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import EntrepriseForm from "@/components/BuildEntreprise/EntrepriseForm";

// Parcours réel après ce formulaire : /PaletteColor -> /Typographie -> /Logo
// (voir les router.push de src/components/Identite_visuel). On le rappelle
// pour que l'utilisateur sache où il en est, sans inventer d'étape.
const ETAPES = [
  { libelle: "Votre entreprise", detail: "Nom, secteur, coordonnées" },
  { libelle: "Palette de couleurs", detail: "Proposée selon votre secteur" },
  { libelle: "Typographie", detail: "Les polices de votre marque" },
  { libelle: "Logo", detail: "Généré à partir de tout ça" },
];

export default function CreateEntreprise() {
  return (
    <div className="bg-background text-on-background antialiased flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex min-w-0 flex-col h-screen overflow-hidden bg-[#F6F4EF] relative">
        <TopNav />

        {/* Marges réduites sous lg (48 px de chaque côté laissaient ~215 px au
            formulaire sur un téléphone) ; inchangé sur bureau. */}
        <main className="flex-1 overflow-y-auto">
          {/* Le fond est posé sur ce bloc (et non sur <main>) pour couvrir
              toute la hauteur défilable, pas seulement la fenêtre. */}
          <div className="relative isolate min-h-full p-6 lg:p-2xl">
            <FondPapier />

            <div className="mx-auto max-w-[1040px] pb-12">
              <header className="cascade-floue mb-8 max-w-[640px]">
                <h1 className="text-[32px] font-normal leading-[1.1] tracking-[-0.03em] text-on-surface sm:text-[36px]">
                  Présentez votre{" "}
                  <em className="font-semibold text-primary">entreprise</em>.
                </h1>
                <p className="mt-3 text-[15px] leading-relaxed text-on-surface">
                  Son nom, son secteur et ses coordonnées : c&apos;est à partir
                  de ces informations que nous construirons son identité
                  visuelle, puis son site.
                </p>
              </header>

              <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
                {/* Carte blanche nette, même rendu que la carte de connexion */}
                <section
                  aria-label="Formulaire de création d'entreprise"
                  className="animate-rise-in min-w-0 flex-1 rounded-[20px] border border-black/[0.07] bg-white px-5 py-7 shadow-[0_1px_2px_rgba(24,24,27,0.05),0_16px_40px_-12px_rgba(24,24,27,0.14)] sm:px-9 sm:py-9"
                >
                  <EntrepriseForm />
                </section>

                <Parcours />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/** Colonne latérale : les quatre étapes du parcours, celle-ci en cours. */
function Parcours() {
  return (
    <aside
      aria-label="Étapes du parcours"
      className="cascade-floue w-full shrink-0 lg:w-[260px] lg:pt-2 [--cascade-depart:420ms]"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
        Et ensuite
      </p>
      <ol className="mt-4">
        {ETAPES.map((etape, index) => {
          const enCours = index === 0;
          const derniere = index === ETAPES.length - 1;
          return (
            <li
              key={etape.libelle}
              className="relative flex gap-3.5 pb-6 last:pb-0"
            >
              {!derniere && (
                <span
                  aria-hidden="true"
                  className="absolute left-[13px] top-7 h-[calc(100%-16px)] w-px bg-outline-variant"
                />
              )}
              <span
                aria-hidden="true"
                className={
                  enCours
                    ? "flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-white"
                    : "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] border-outline-variant bg-white text-[13px] font-semibold text-on-surface-variant"
                }
              >
                {index + 1}
              </span>
              <div className="min-w-0 pt-0.5">
                <p
                  className={
                    enCours
                      ? "text-[15px] font-semibold leading-tight text-primary"
                      : "text-[15px] font-semibold leading-tight text-on-surface"
                  }
                >
                  {etape.libelle}
                  {enCours && (
                    <span className="sr-only"> (étape en cours)</span>
                  )}
                </p>
                <p className="mt-1 text-[13px] leading-snug text-on-surface-variant">
                  {etape.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}

/**
 * Trame de points verts, estompée au centre pour laisser la carte
 * respirer : même papier chaud que l'écran de connexion (AuthLayout).
 */
function FondPapier() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
    >
      <svg className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_60%_55%_at_38%_45%,transparent_30%,black_85%)]">
        <defs>
          <pattern
            id="entreprise-trame"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="0" cy="0" r="1.3" fill="#0F7A38" fillOpacity="0.16" />
            <circle cx="48" cy="0" r="1.3" fill="#0F7A38" fillOpacity="0.16" />
            <circle cx="0" cy="48" r="1.3" fill="#0F7A38" fillOpacity="0.16" />
            <circle cx="48" cy="48" r="1.3" fill="#0F7A38" fillOpacity="0.16" />
            <path
              d="M24 18 L30 24 L24 30 L18 24 Z"
              fill="none"
              stroke="#0F7A38"
              strokeOpacity="0.1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#entreprise-trame)" />
      </svg>
    </div>
  );
}
