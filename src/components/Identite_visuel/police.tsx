"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Circle, CircleCheck, MessageSquareText } from "lucide-react";
import { useEntrepriseId } from "@/hooks/useEntrepriseId";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { libelleSecteur } from "@/data/entreprise";
import ChatComposer from "@/components/Templates/ChatComposer";
import SoonBadge from "@/components/ui/SoonBadge";
import Button from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";

// Exporté pour VueEnsemble.tsx (aperçu en lecture seule des polices déjà
// enregistrées, avec la même correspondance libellé -> variable CSS).
export const FONT_FAMILY_VARS: Record<string, string> = {
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

// Les identifiants et les libellés de polices (headingLabel / bodyLabel)
// ne changent pas : c'est par eux qu'on retrouve la paire déjà enregistrée.
const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "elegant-editorial",
    name: "Éditorial",
    headingFontFamily: FONT_FAMILY_VARS["Playfair Display"],
    bodyFontFamily: FONT_FAMILY_VARS["Inter"],
    headingLabel: "Playfair Display",
    bodyLabel: "Inter",
  },
  {
    id: "modern-corporate",
    name: "Entreprise",
    headingFontFamily: FONT_FAMILY_VARS["Montserrat"],
    headingWeight: 600,
    bodyFontFamily: FONT_FAMILY_VARS["Open Sans"],
    headingLabel: "Montserrat",
    bodyLabel: "Open Sans",
  },
  {
    id: "bold-minimal",
    name: "Minimal",
    headingFontFamily: FONT_FAMILY_VARS["Inter"],
    headingWeight: 700,
    headingLetterSpacing: "-0.02em",
    bodyFontFamily: FONT_FAMILY_VARS["Inter"],
    headingLabel: "Inter (Bold)",
    bodyLabel: "Inter",
  },
  {
    id: "classic-serif",
    name: "Classique",
    headingFontFamily: FONT_FAMILY_VARS["Merriweather"],
    bodyFontFamily: FONT_FAMILY_VARS["Lato"],
    headingLabel: "Merriweather",
    bodyLabel: "Lato",
  },
  {
    id: "brand-heading",
    name: "Affirmé",
    headingFontFamily: FONT_FAMILY_VARS["Manrope"],
    headingWeight: 800,
    bodyFontFamily: FONT_FAMILY_VARS["Inter"],
    headingLabel: "Manrope",
    bodyLabel: "Inter",
  },
];

// Liste utilisée pour les <select> d'édition manuelle
const FONT_OPTIONS = Object.keys(FONT_FAMILY_VARS);

interface TypographyBuilderProps {
  /** Appelé quand l'utilisateur clique sur « Continuer » */
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

  // Nom, slogan et secteur pour que l'aperçu montre la vraie entreprise.
  const { entreprise: entrepriseSelectionnee, entreprises } = useEntreprise();
  const entreprise =
    entreprises.find((e) => e.id === entrepriseId) ?? entrepriseSelectionnee;

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

  // Les choix manuels priment sur la paire sélectionnée pour l'aperçu
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

  const nomEntreprise = entreprise?.nom || "Nom de votre entreprise";
  const slogan =
    entreprise?.slogan || "Votre slogan apparaîtra ici, sous le nom.";
  const secteur = libelleSecteur(entreprise?.secteur_activite ?? null);
  const paragraphe = secteur
    ? `${nomEntreprise} est une entreprise du secteur ${secteur}. Ce paragraphe montre la police de texte sur plusieurs lignes, telle qu'elle apparaîtra sur votre site et vos supports.`
    : "Ce paragraphe montre la police de texte sur plusieurs lignes, telle qu'elle apparaîtra sur votre site et vos supports.";

  return (
    <div className="grid grid-cols-1 items-start gap-6 pb-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* Colonne gauche : aperçu */}
      <div className="flex min-w-0 flex-col gap-md xl:sticky xl:top-6">
        <h2 className="text-headline-sm font-headline-sm text-on-surface">
          Aperçu
        </h2>

        <div className="flex min-h-[480px] flex-col justify-center overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest px-6 py-10 lg:px-10">
          <div className="flex w-full flex-col gap-5">
            {secteur && (
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                {secteur}
              </p>
            )}
            <h1
              className="w-full text-3xl leading-tight text-on-surface sm:text-4xl"
              style={{
                fontFamily: previewHeadingFont,
                fontWeight: selectedPairing.headingWeight ?? 700,
                letterSpacing: selectedPairing.headingLetterSpacing,
              }}
            >
              {nomEntreprise}
            </h1>
            <h2
              className="w-full text-xl text-on-surface-variant sm:text-2xl"
              style={{ fontFamily: previewHeadingFont }}
            >
              {slogan}
            </h2>
            <p
              className="w-full text-base leading-7 text-on-surface-variant sm:text-lg"
              style={{ fontFamily: previewBodyFont }}
            >
              {paragraphe}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span
                className="rounded-lg bg-primary px-6 py-3 text-label-md font-label-md font-semibold text-on-primary"
                style={{ fontFamily: previewBodyFont }}
              >
                Nous contacter
              </span>
              <span
                className="rounded-lg border border-outline-variant bg-surface-container-lowest px-6 py-3 text-label-md font-label-md font-semibold text-on-surface"
                style={{ fontFamily: previewBodyFont }}
              >
                En savoir plus
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite : contrôles */}
      <div className="flex min-w-0 w-full flex-col gap-lg">
        <div>
          <h3 className="text-headline-sm font-headline-sm text-on-surface">
            Choisissez vos polices
          </h3>
          <p className="mt-1 text-body-sm font-body-sm text-on-surface-variant">
            Une police pour les titres, une pour le texte.
          </p>
        </div>

        {/* Grille des paires de polices */}
        <div className="stagger-in grid grid-cols-1 gap-md sm:grid-cols-2">
          {FONT_PAIRINGS.map((pairing) => {
            const isActive = pairing.id === selectedPairing.id;
            return (
              <button
                key={pairing.id}
                type="button"
                onClick={() => handleSelectPairing(pairing)}
                aria-pressed={isActive}
                className={`group relative rounded-xl border-2 bg-surface-container-lowest p-md text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  isActive
                    ? "border-primary"
                    : "border-surface-variant hover:border-outline-variant"
                }`}
              >
                <span className="absolute right-md top-md">
                  {isActive ? (
                    <CircleCheck
                      className="h-5 w-5 text-primary"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="h-5 w-5 text-outline-variant opacity-0 transition-opacity group-hover:opacity-100"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  )}
                </span>

                <p className="mb-1 pr-8 text-label-sm font-label-sm text-on-surface-variant">
                  {pairing.name}
                </p>
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
                  className="mb-4 text-body-sm font-body-sm text-on-surface-variant"
                  style={{ fontFamily: pairing.bodyFontFamily }}
                >
                  Le texte de votre marque
                </p>
                <div className="flex flex-col gap-1 text-label-sm font-label-sm text-on-surface-variant">
                  <span>Titres : {pairing.headingLabel}</span>
                  <span>Texte : {pairing.bodyLabel}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Édition manuelle */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <h4 className="mb-md text-label-md font-label-md text-on-surface">
            Éditer manuellement les polices
          </h4>
          <div className="flex flex-col gap-sm">
            <div className="flex items-center gap-md">
              <label
                htmlFor="police-titres"
                className="w-24 shrink-0 text-label-sm font-label-sm text-on-surface-variant"
              >
                Titres
              </label>
              <select
                id="police-titres"
                value={headingOverride}
                onChange={(e) => setHeadingOverride(e.target.value)}
                className="h-11 min-w-0 flex-1 cursor-pointer rounded-lg border border-border-strong bg-surface-container-low px-md text-body-sm font-body-sm text-on-surface outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
              >
                {FONT_OPTIONS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-md">
              <label
                htmlFor="police-texte"
                className="w-24 shrink-0 text-label-sm font-label-sm text-on-surface-variant"
              >
                Texte
              </label>
              <select
                id="police-texte"
                value={bodyOverride}
                onChange={(e) => setBodyOverride(e.target.value)}
                className="h-11 min-w-0 flex-1 cursor-pointer rounded-lg border border-border-strong bg-surface-container-low px-md text-body-sm font-body-sm text-on-surface outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
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

        {/* Génération IA */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="mb-sm flex items-center gap-2">
            <MessageSquareText
              className="h-5 w-5 text-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <h4 className="text-label-md font-label-md font-bold text-on-surface">
              Laissez l&apos;IA vous aider
            </h4>
            {!onGenerateWithAI && <SoonBadge />}
          </div>
          {/* Même composeur que le générateur de site (ChatComposer).
              Tant que onGenerateWithAI n'est pas branché, la zone reste
              visible mais désactivée (badge « Bientôt » dans le titre). */}
          <ChatComposer
            value={aiPrompt}
            onChange={setAiPrompt}
            onSubmit={handleAIGenerate}
            disabled={!onGenerateWithAI}
            placeholder="Décrivez le style recherché…"
            exemples={[
              "Start-up tech, moderne et minimaliste…",
              "Boutique de mode haut de gamme…",
              "École, sérieuse mais accueillante…",
            ]}
          />
        </div>

        {entrepriseError && <FormError>{entrepriseError}</FormError>}

        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            loading={loadingEntreprise}
            disabled={!entrepriseId}
          >
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
}
