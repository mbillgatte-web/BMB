"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useEntrepriseId } from "@/hooks/useEntrepriseId";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";


const FONT_FAMILY_VARS: Record<string, string> = {
  Inter: "var(--font-family-inter)",
  "Playfair Display": "var(--font-family-playfair)",
  Montserrat: "var(--font-family-montserrat)",
  "Open Sans": "var(--font-family-open-sans)",
  Merriweather: "var(--font-family-merriweather)",
  Lato: "var(--font-family-lato)",
  Manrope: "var(--font-family-manrope)",
};

interface FontPairing {
  id: string;
  name: string;
  headingFontFamily: string;
  headingWeight?: number;
  headingLetterSpacing?: string;
  bodyFontFamily: string;
  headingLabel: string;
  bodyLabel: string;
}

const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "elegant-editorial",
    name: "Elegant Editorial",
    headingFontFamily: FONT_FAMILY_VARS["Playfair Display"],
    bodyFontFamily: FONT_FAMILY_VARS["Inter"],
    headingLabel: "Playfair Display",
    bodyLabel: "Inter",
  },
  {
    id: "modern-corporate",
    name: "Modern Corporate",
    headingFontFamily: FONT_FAMILY_VARS["Montserrat"],
    headingWeight: 600,
    bodyFontFamily: FONT_FAMILY_VARS["Open Sans"],
    headingLabel: "Montserrat",
    bodyLabel: "Open Sans",
  },
  {
    id: "bold-minimal",
    name: "Bold Minimal",
    headingFontFamily: FONT_FAMILY_VARS["Inter"],
    headingWeight: 700,
    headingLetterSpacing: "-0.02em",
    bodyFontFamily: FONT_FAMILY_VARS["Inter"],
    headingLabel: "Inter (Bold)",
    bodyLabel: "Inter",
  },
  {
    id: "classic-serif",
    name: "Classic Serif",
    headingFontFamily: FONT_FAMILY_VARS["Merriweather"],
    bodyFontFamily: FONT_FAMILY_VARS["Lato"],
    headingLabel: "Merriweather",
    bodyLabel: "Lato",
  },

  {
  id: "brand-heading",
  name: "Brand Heading",
  headingFontFamily: FONT_FAMILY_VARS["Manrope"],
  headingWeight: 800,
  bodyFontFamily: FONT_FAMILY_VARS["Inter"],
  headingLabel: "Manrope",
  bodyLabel: "Inter",
  },
];

// Liste utilisée pour les <select> d'override manuel
const FONT_OPTIONS = Object.keys(FONT_FAMILY_VARS);

interface TypographyBuilderProps {
  /** Appelé quand l'utilisateur clique sur "Continue to Style" */
  onContinue?: (selected: {
    pairing: FontPairing;
    headingOverride: string;
    bodyOverride: string;
  }) => void;
  /** Appelé quand l'utilisateur soumet une description à l'IA */
  onGenerateWithAI?: (prompt: string) => void;
}

export default function TypographyBuilder({
  onContinue,
  onGenerateWithAI,
}: TypographyBuilderProps) {
  const router = useRouter();
  const {
    entrepriseId,
    loading: loadingEntreprise,
    error: entrepriseError,
  } = useEntrepriseId();

  const { identiteVisuelle } = useIdentiteVisuelle(entrepriseId);

  const [selectedId, setSelectedId] = useState(FONT_PAIRINGS[0].id);
  const [aiPrompt, setAiPrompt] = useState("");
  const [headingOverride, setHeadingOverride] = useState(
    FONT_PAIRINGS[0].headingLabel
  );
  const [bodyOverride, setBodyOverride] = useState(FONT_PAIRINGS[0].bodyLabel);

  // Préremplit les polices à partir de ce qui est déjà enregistré pour
  // cette entreprise -- même technique de rendu (pas d'effet) que dans
  // PaletteBuilder.tsx, voir ses commentaires pour le détail.
  const [prevIdentiteVisuelle, setPrevIdentiteVisuelle] = useState(identiteVisuelle);
  if (identiteVisuelle !== prevIdentiteVisuelle) {
    setPrevIdentiteVisuelle(identiteVisuelle);

    if (identiteVisuelle) {
      if (identiteVisuelle.police_titre) {
        setHeadingOverride(identiteVisuelle.police_titre);
      }
      if (identiteVisuelle.police_texte) {
        setBodyOverride(identiteVisuelle.police_texte);
      }

      const match = FONT_PAIRINGS.find(
        (p) =>
          p.headingLabel === identiteVisuelle.police_titre &&
          p.bodyLabel === identiteVisuelle.police_texte
      );
      if (match) setSelectedId(match.id);
    }
  }

  const selectedPairing = useMemo(
    () => FONT_PAIRINGS.find((p) => p.id === selectedId) ?? FONT_PAIRINGS[0],
    [selectedId]
  );

  // Les overrides manuels priment sur la paire sélectionnée pour l'aperçu
  const previewHeadingFont =
    FONT_FAMILY_VARS[headingOverride] ?? FONT_FAMILY_VARS["Inter"];
  const previewBodyFont =
    FONT_FAMILY_VARS[bodyOverride] ?? FONT_FAMILY_VARS["Inter"];

  const handleSelectPairing = (pairing: FontPairing) => {
    setSelectedId(pairing.id);
    setHeadingOverride(pairing.headingLabel);
    setBodyOverride(pairing.bodyLabel);
  };

  const handleAIGenerate = () => {
    if (aiPrompt.trim()) {
      onGenerateWithAI?.(aiPrompt.trim());
    }
  };

  const handleContinue = () => {
    // Comme pour la palette : pas d'écriture en BD ici, juste en mémoire
    // le temps d'arriver à /Logo, qui enverra tout d'un coup à la fin.
    if (entrepriseId) {
      localStorage.setItem(
        `identite:${entrepriseId}:typographie`,
        JSON.stringify({
          policeTitre: headingOverride,
          policeTexte: bodyOverride,
        })
      );
    }

    onContinue?.({
      pairing: selectedPairing,
      headingOverride,
      bodyOverride,
    });

    router.push(`/Logo?entrepriseId=${entrepriseId}`);
  };

  return (
    <div className="relative isolate grid grid-cols-1 items-start gap-6 pb-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* Colonne gauche : aperçu live */}
      <div className="min-w-0 lg:sticky lg:top-6">
        <div className="relative flex min-h-[560px] flex-col overflow-hidden rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm">
          <div className="flex h-10 shrink-0 items-center gap-2 border-b border-surface-variant bg-surface px-4">
            <span className="h-3 w-3 rounded-full bg-surface-variant" />
            <span className="h-3 w-3 rounded-full bg-surface-variant" />
            <span className="h-3 w-3 rounded-full bg-surface-variant" />
            <span className="ml-4 h-5 w-48 rounded-sm bg-surface-container" />
          </div>

          <div className="relative flex flex-1 flex-col justify-center overflow-hidden bg-surface-container-lowest px-6 py-10 lg:px-8">
            <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="relative z-10 flex w-full flex-col gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-container">
                Typography system
              </p>
              <h1
                className="w-full text-3xl leading-tight text-on-surface sm:text-4xl"
                style={{
                  fontFamily: previewHeadingFont,
                  fontWeight: selectedPairing.headingWeight ?? 700,
                  letterSpacing: selectedPairing.headingLetterSpacing,
                }}
              >
                Design is intelligence made visible.
              </h1>
              <h2
                className="w-full text-xl text-on-surface-variant sm:text-2xl"
                style={{ fontFamily: previewHeadingFont }}
              >
                Elevate your brand with precision and clarity.
              </h2>
              <p
                className="w-full text-base leading-7 text-secondary sm:text-lg"
                style={{ fontFamily: previewBodyFont }}
              >
                The right typography establishes hierarchy, sets the tone, and
                ensures readability across all platforms. In our workspace,
                every element is designed to recede, allowing your creative
                decisions to command attention.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  className="rounded-lg bg-primary-container px-6 py-3 text-label-md font-label-md font-semibold text-on-primary shadow-sm"
                  style={{ fontFamily: previewBodyFont }}
                >
                  Primary Action
                </button>
                <button
                  className="rounded-lg border border-surface-variant bg-surface-container-lowest px-6 py-3 text-label-md font-label-md font-semibold text-on-surface"
                  style={{ fontFamily: previewBodyFont }}
                >
                  Secondary
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite : contrôles */}
      <div className="flex min-w-0 w-full flex-col gap-lg">
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">
            Choissez votre Police 
          </h3>
          <p className="mt-1 text-body-sm font-body-sm text-secondary">
            Sélectionnez une paire de polices pour votre marque.
          </p>
        </div>

        {/* Génération IA */}
        <div className="relative overflow-hidden rounded-xl border border-primary-fixed-dim/30 bg-gradient-to-br from-surface-container-lowest to-inverse-primary/10 p-lg shadow-sm">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-2xl" />
          <div className="relative z-10 flex items-center gap-2 mb-sm">
            <span className="material-symbols-outlined text-primary-container text-[20px]">
              auto_awesome
            </span>
            <h4 className="text-label-md font-label-md font-bold text-on-surface">
              Laissez l'IA vous aider !
            </h4>
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Minimalist tech startup, Luxury fashion..."
              className="h-20 w-full resize-none rounded-lg border border-surface-variant bg-white p-3 text-body-sm font-body-sm placeholder:text-secondary focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim()}
              className="self-end rounded-md border border-surface-variant bg-surface px-4 py-2 text-label-sm font-label-sm text-on-surface shadow-sm transition-colors hover:bg-surface-variant disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generere
            </button>
          </div>
        </div>

        {/* Grille des paires de polices */}
        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          {FONT_PAIRINGS.map((pairing) => {
            const isActive = pairing.id === selectedPairing.id;
            return (
              <button
                key={pairing.id}
                onClick={() => handleSelectPairing(pairing)}
                className={`group relative rounded-xl border-2 p-md text-left shadow-sm transition-colors ${
                  isActive
                    ? "border-primary-container bg-surface-container-lowest"
                    : "border-surface-variant bg-surface-container-lowest hover:border-outline-variant"
                }`}
              >
                <span className="absolute right-md top-md">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-opacity ${
                      isActive
                        ? "text-primary-container opacity-100"
                        : "text-outline-variant opacity-0 group-hover:opacity-100"
                    }`}
                    style={
                      isActive
                        ? ({ fontVariationSettings: "'FILL' 1" } as React.CSSProperties)
                        : undefined
                    }
                  >
                    {isActive ? "radio_button_checked" : "radio_button_unchecked"}
                  </span>
                </span>

                <h3
                  className="mb-2 text-2xl text-on-surface"
                  style={{
                    fontFamily: pairing.headingFontFamily,
                    fontWeight: pairing.headingWeight ?? 600,
                    letterSpacing: pairing.headingLetterSpacing,
                  }}
                >
                  Aa
                </h3>
                <p
                  className="mb-4 truncate text-body-sm font-body-sm text-secondary"
                  style={{ fontFamily: pairing.bodyFontFamily }}
                >
                  Your Brand Voice
                </p>
                <div className="flex flex-col gap-1 text-label-sm font-label-sm text-on-surface-variant">
                  <span className="truncate">H: {pairing.headingLabel}</span>
                  <span className="truncate">B: {pairing.bodyLabel}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Overrides manuels */}
        <div className="mt-sm rounded-xl border border-surface-variant bg-surface-container-lowest p-md shadow-sm">
          <h4 className="mb-md text-label-md font-label-md text-on-surface">
            Editer manuellement les polices
          </h4>
          <div className="flex flex-col gap-sm">
            <div className="flex items-center gap-md">
              <label className="w-24 shrink-0 text-label-sm font-label-sm uppercase text-secondary">
                Principal
              </label>
              <select
                value={headingOverride}
                onChange={(e) => setHeadingOverride(e.target.value)}
                className="min-w-0 flex-1 cursor-pointer appearance-none rounded-lg border border-surface-variant bg-surface px-md py-sm text-body-sm font-body-sm text-on-surface outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-md">
              <label className="w-24 shrink-0 text-label-sm font-label-sm uppercase text-secondary">
                Secondaire
              </label>
              <select
                value={bodyOverride}
                onChange={(e) => setBodyOverride(e.target.value)}
                className="min-w-0 flex-1 cursor-pointer appearance-none rounded-lg border border-surface-variant bg-surface px-md py-sm text-body-sm font-body-sm text-on-surface outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {entrepriseError && (
        <p className="col-span-full font-body-sm text-body-sm text-red-600">
          {entrepriseError}
        </p>
      )}

      {/* Barre d'action "Continue" : sticky au composant, pas au viewport global */}
      <div className="col-span-full sticky bottom-4 z-40 flex justify-end pt-2">
        <button
          type="button"
          onClick={handleContinue}
          disabled={loadingEntreprise || !entrepriseId}
          className="flex items-center gap-sm rounded-full bg-primary-container px-xl py-md text-label-md font-label-md font-bold text-on-primary shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Importez votre logo
          <span className="material-symbols-outlined text-[20px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}
