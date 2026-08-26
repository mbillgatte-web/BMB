import React, { useState, useMemo } from "react";

/**
 * PaletteBuilder
 * ---------------
 * Étape "Palette" du module d'identité visuelle (Brand Builder).
 * - L'utilisateur choisit entre 2 ou 3 couleurs.
 * - Il peut sélectionner une palette prédéfinie, ajuster manuellement,
 *   ou générer une palette via IA (placeholder pour l'instant).
 * - Un aperçu live (Live Preview) reflète le choix en temps réel.
 *
 * Prérequis Tailwind : le thème custom (colors, spacing, fontFamily,
 * fontSize) défini dans le prompt Stitch doit être ajouté à
 * tailwind.config.js du projet. Voir le bloc `theme.extend` fourni
 * précédemment. La police "Material Symbols Outlined" et "Inter"
 * doivent être chargées globalement (index.html ou _document).
 */

type PaletteMode = 2 | 3;

interface Palette {
  id: string;
  name: string;
  background: string;
  primary: string;
  headingText: string;
  bodyText: string;
  // couleur additionnelle pour le mode "3 couleurs"
  accent?: string;
}

const PALETTES_2: Palette[] = [
  {
    id: "corporate-indigo",
    name: "Corporate Indigo",
    background: "#f8f9fa",
    primary: "#3525cd",
    headingText: "#191c1d",
    bodyText: "#5a5e69",
  },
  {
    id: "editorial-mono",
    name: "Editorial Mono",
    background: "#fdfbf7",
    primary: "#27272a",
    headingText: "#27272a",
    bodyText: "#52525b",
  },
  {
    id: "warm-amber",
    name: "Warm Amber",
    background: "#fefce8",
    primary: "#ca8a04",
    headingText: "#422006",
    bodyText: "#713f12",
  },
  {
    id: "eco-green",
    name: "Eco Green",
    background: "#f0fdf4",
    primary: "#16a34a",
    headingText: "#052e16",
    bodyText: "#14532d",
  },
];

// Exemple de palettes 3 couleurs (background + primary + accent)
const PALETTES_3: Palette[] = PALETTES_2.map((p) => ({
  ...p,
  accent:
    p.id === "corporate-indigo"
      ? "#c3c0ff"
      : p.id === "editorial-mono"
      ? "#a1a1aa"
      : p.id === "warm-amber"
      ? "#fde047"
      : "#86efac",
}));

interface PaletteBuilderProps {
  /** Appelé quand l'utilisateur clique sur "Continue to Typography" */
  onContinue?: (selected: { palette: Palette; mode: PaletteMode }) => void;
  /** Appelé quand l'utilisateur soumet une description à l'IA */
  onGenerateWithAI?: (prompt: string) => void;
}

export default function PaletteBuilder({
  onContinue,
  onGenerateWithAI,
}: PaletteBuilderProps) {
  const [mode, setMode] = useState<PaletteMode>(2);
  const [selectedId, setSelectedId] = useState<string>(PALETTES_2[0].id);
  const [aiPrompt, setAiPrompt] = useState("");

  const palettes = mode === 2 ? PALETTES_2 : PALETTES_3;

  const selectedPalette = useMemo(
    () => palettes.find((p) => p.id === selectedId) ?? palettes[0],
    [palettes, selectedId]
  );

  // texte du bouton primaire : blanc sauf sur fonds clairs (palettes "light primary")
  const lightPrimaries = ["#fdfbf7", "#fefce8", "#f0fdf4"];
  const primaryBtnTextColor = lightPrimaries.includes(selectedPalette.primary)
    ? "#191c1d"
    : "#ffffff";

  const handleAIGenerate = () => {
    if (aiPrompt.trim()) {
      onGenerateWithAI?.(aiPrompt.trim());
    }
  };

  return (
    <div className="flex flex-col xl:flex-row gap-xl pb-24">
      {/* Colonne gauche : aperçu live */}
      <div className="flex-1 flex flex-col gap-md">
        <h2 className="text-headline-sm font-headline-sm text-on-surface">
          Live Preview
        </h2>

        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant canvas-shadow overflow-hidden flex-1 min-h-[500px] flex flex-col relative transition-colors duration-500">
          {/* Barre de navigateur factice */}
          <div className="h-10 bg-surface border-b border-surface-variant flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-surface-variant" />
            <div className="w-3 h-3 rounded-full bg-surface-variant" />
            <div className="w-3 h-3 rounded-full bg-surface-variant" />
            <div className="ml-4 h-5 w-48 bg-surface-container rounded-sm" />
          </div>

          {/* Contenu de l'aperçu */}
          <div
            className="p-xl flex-1 flex flex-col justify-center relative overflow-hidden transition-colors duration-500"
            style={{ backgroundColor: selectedPalette.background }}
          >
            <div
              className="absolute -top-24 -right-24 w-96 h-96 rounded-full opacity-10 blur-3xl transition-colors duration-500"
              style={{ backgroundColor: selectedPalette.primary }}
            />
            <div className="max-w-md relative z-10">
              <h1
                className="text-headline-xl font-headline-xl mb-sm transition-colors duration-500"
                style={{ color: selectedPalette.headingText }}
              >
                Elevate your brand identity.
              </h1>
              <p
                className="text-body-lg font-body-lg mb-lg transition-colors duration-500"
                style={{ color: selectedPalette.bodyText }}
              >
                Create cohesive, stunning visual systems in minutes with
                intelligent color curation.
              </p>
              <div className="flex gap-sm">
                <button
                  className="px-6 py-3 rounded-lg font-label-md text-label-md shadow-sm transition-all duration-500"
                  style={{
                    backgroundColor: selectedPalette.primary,
                    color: primaryBtnTextColor,
                  }}
                >
                  Get Started
                </button>
                <button
                  className="px-6 py-3 rounded-lg font-label-md text-label-md border bg-white transition-all duration-500"
                  style={{
                    borderColor: selectedPalette.primary,
                    color: selectedPalette.headingText,
                  }}
                >
                  Learn More
                </button>
                {mode === 3 && selectedPalette.accent && (
                  <span
                    className="w-11 h-11 rounded-lg shadow-sm shrink-0"
                    style={{ backgroundColor: selectedPalette.accent }}
                    title="Accent color"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite : contrôles */}
      <div className="w-full xl:w-[450px] flex flex-col gap-lg">
        {/* Palettes prédéfinies */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant canvas-shadow p-lg">
          <div className="flex justify-between items-center mb-md">
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Curated Palettes
            </h3>
            <div className="flex bg-surface-container rounded-lg p-1">
              <button
                onClick={() => setMode(2)}
                className={`px-3 py-1 text-label-sm font-label-sm rounded-md transition-colors ${
                  mode === 2
                    ? "bg-white shadow-sm text-on-surface"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                2 Colors
              </button>
              <button
                onClick={() => setMode(3)}
                className={`px-3 py-1 text-label-sm font-label-sm rounded-md transition-colors ${
                  mode === 3
                    ? "bg-white shadow-sm text-on-surface"
                    : "text-secondary hover:text-on-surface"
                }`}
              >
                3 Colors
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {palettes.map((p) => {
              const isActive = p.id === selectedPalette.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`text-left rounded-lg p-2 transition-colors border-2 ${
                    isActive
                      ? "border-primary"
                      : "border-surface-variant hover:border-outline-variant"
                  }`}
                >
                  <div className="flex h-12 rounded-md overflow-hidden mb-2">
                    <div
                      className="flex-1"
                      style={{ backgroundColor: p.primary }}
                    />
                    <div
                      className="flex-1"
                      style={{ backgroundColor: p.background }}
                    />
                    {mode === 3 && p.accent && (
                      <div
                        className="flex-1"
                        style={{ backgroundColor: p.accent }}
                      />
                    )}
                  </div>
                  <div
                    className={`text-label-sm font-label-sm text-center ${
                      isActive ? "text-on-surface" : "text-secondary"
                    }`}
                  >
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Génération IA */}
        <div className="bg-gradient-to-br from-surface-container-lowest to-inverse-primary/10 rounded-xl border border-primary-fixed-dim/30 canvas-shadow p-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="flex items-center gap-2 mb-sm relative z-10">
            <span className="material-symbols-outlined text-primary text-[20px]">
              auto_awesome
            </span>
            <h3 className="text-label-md font-label-md font-bold text-on-surface">
              Generate with AI
            </h3>
          </div>
          <div className="relative z-10 flex flex-col gap-3">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-white border border-surface-variant rounded-lg p-3 text-body-sm font-body-sm placeholder:text-secondary focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none h-20"
              placeholder="e.g. 'A calming wellness brand with soft earthy tones and a clean modern aesthetic.'"
            />
            <button
              onClick={handleAIGenerate}
              disabled={!aiPrompt.trim()}
              className="self-end bg-surface text-on-surface border border-surface-variant font-label-sm text-label-sm px-4 py-2 rounded-md hover:bg-surface-variant transition-colors shadow-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate
            </button>
          </div>
        </div>

        {/* Ajustements manuels */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant canvas-shadow p-lg">
          <h3 className="text-label-md font-label-md text-on-surface mb-md">
            Manual Adjustments
          </h3>
          <div className="space-y-4">
            <ColorField
              label="Primary Action"
              hexValue={selectedPalette.primary}
              onChange={(hex) =>
                setSelectedIdOverride(setSelectedId, selectedPalette, "primary", hex)
              }
            />
            <ColorField
              label="Background"
              hexValue={selectedPalette.background}
              onChange={(hex) =>
                setSelectedIdOverride(setSelectedId, selectedPalette, "background", hex)
              }
            />
            {mode === 3 && selectedPalette.accent && (
              <ColorField
                label="Accent"
                hexValue={selectedPalette.accent}
                onChange={(hex) =>
                  setSelectedIdOverride(setSelectedId, selectedPalette, "accent", hex)
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Bouton flottant Continue */}
      <div className="fixed bottom-lg right-lg z-50">
        <button
          onClick={() => onContinue?.({ palette: selectedPalette, mode })}
          className="bg-primary-container text-on-primary font-label-md text-label-md px-6 py-3 rounded-full hover:bg-primary transition-all shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)] flex items-center gap-2"
        >
          Continue to Typography
          <span className="material-symbols-outlined text-[18px]">
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
}

/** Ligne "couleur + input hex" réutilisable pour la section Manual Adjustments */
function ColorField({
  label,
  hexValue,
  onChange,
}: {
  label: string;
  hexValue: string;
  onChange: (hex: string) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <label className="relative w-8 h-8 rounded border border-surface-variant overflow-hidden cursor-pointer">
          <span
            className="absolute inset-0"
            style={{ backgroundColor: hexValue }}
          />
          <input
            type="color"
            value={hexValue}
            onChange={(e) => onChange(e.target.value)}
            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
          />
        </label>
        <span className="text-body-sm font-body-sm text-on-surface">
          {label}
        </span>
      </div>
      <span className="text-label-sm font-label-sm text-secondary font-mono uppercase">
        {hexValue}
      </span>
    </div>
  );
}

/**
 * Note d'implémentation : cette fonction est un point d'extension simple.
 * Dans une vraie appli, préférez remonter la palette "custom" dans un
 * state dédié (ex: `customPalette`) plutôt que de muter une palette
 * prédéfinie. Laissé volontairement minimal ici pour rester lisible.
 */
function setSelectedIdOverride(
  _setSelectedId: (id: string) => void,
  _current: Palette,
  _field: keyof Palette,
  _hex: string
) {
  // Placeholder : à connecter à ta logique de state (ex: custom palette
  // séparée + sélection automatique de l'id "custom").
  console.log("Ajustement manuel non encore branché à un state custom.");
}
