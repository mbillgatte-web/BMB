"use client";

import React, { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText } from "lucide-react";
import { useEntrepriseId } from "@/hooks/useEntrepriseId";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { libelleSecteur } from "@/data/entreprise";
import ChatComposer from "@/components/Templates/ChatComposer";
import SoonBadge from "@/components/ui/SoonBadge";
import Button from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";

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

/** Identifiant réservé à la palette construite par l'utilisateur. */
const PERSO_ID = "perso";

// Les valeurs hexadécimales de ces palettes ne doivent pas changer :
// c'est par comparaison exacte qu'on retrouve, au chargement, la palette
// qu'une entreprise a déjà enregistrée (voir plus bas).
const PALETTES_2: Palette[] = [
  {
    id: "corporate-indigo",
    name: "Bleu confiance",
    background: "#f8f9fa",
    primary: "#3525cd",
    headingText: "#191c1d",
    bodyText: "#5a5e69",
  },
  {
    id: "editorial-mono",
    name: "Noir éditorial",
    background: "#fdfbf7",
    primary: "#27272a",
    headingText: "#27272a",
    bodyText: "#52525b",
  },
  {
    id: "warm-amber",
    name: "Ambre chaleureux",
    background: "#fefce8",
    primary: "#ca8a04",
    headingText: "#422006",
    bodyText: "#713f12",
  },
  {
    id: "eco-green",
    name: "Vert nature",
    background: "#f0fdf4",
    primary: "#16a34a",
    headingText: "#052e16",
    bodyText: "#14532d",
  },
];

const ACCENTS: Record<string, string> = {
  "corporate-indigo": "#c3c0ff",
  "editorial-mono": "#a1a1aa",
  "warm-amber": "#fde047",
  "eco-green": "#86efac",
};

// Palettes 3 couleurs (fond + principale + accent)
const PALETTES_3: Palette[] = PALETTES_2.map((p) => ({
  ...p,
  accent: ACCENTS[p.id],
}));

/** Luminance relative (WCAG) d'une couleur #rrggbb, entre 0 et 1. */
function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return 1;
  const canal = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * canal((n >> 16) & 255) +
    0.7152 * canal((n >> 8) & 255) +
    0.0722 * canal(n & 255)
  );
}

const estClair = (hex: string) => luminance(hex) > 0.4;

/**
 * Construit la palette « Personnalisée » à partir des trois couleurs
 * choisies : les couleurs de texte sont déduites du fond pour rester
 * lisibles (sombres sur fond clair, claires sur fond sombre).
 */
function construirePerso(couleurs: CouleursPerso): Palette {
  const fondClair = estClair(couleurs.background);
  return {
    id: PERSO_ID,
    name: "Personnalisée",
    background: couleurs.background,
    primary: couleurs.primary,
    accent: couleurs.accent,
    headingText: fondClair ? "#191c1d" : "#ffffff",
    bodyText: fondClair ? "#5a5e69" : "#d4d4d8",
  };
}

interface CouleursPerso {
  primary: string;
  background: string;
  accent: string;
}

interface PaletteBuilderProps {
  /** Appelé quand l'utilisateur clique sur « Continuer » */
  onContinue?: (selected: { palette: Palette; mode: PaletteMode }) => void;
  /** Appelé quand l'utilisateur soumet une description à l'IA */
  onGenerateWithAI?: (prompt: string) => void;
}

export default function PaletteBuilder({
  onContinue,
  onGenerateWithAI,
}: PaletteBuilderProps) {
  const router = useRouter();
  // Retrouve l'entreprise du compte connecté (compte_id = auth.uid()),
  // au lieu de la recevoir via l'URL : voir src/hooks/useEntrepriseId.ts.
  const {
    entrepriseId,
    loading: loadingEntreprise,
    error: entrepriseError,
  } = useEntrepriseId();

  // Nom, slogan et secteur pour que l'aperçu montre la vraie entreprise.
  const { entreprise: entrepriseSelectionnee, entreprises } = useEntreprise();
  const entreprise =
    entreprises.find((e) => e.id === entrepriseId) ?? entrepriseSelectionnee;

  // Ce que cette entreprise a déjà enregistré, s'il y a déjà quelque chose
  // (voir src/hooks/useIdentiteVisuelle.ts) -- sert à préremplir ci-dessous.
  const { identiteVisuelle } = useIdentiteVisuelle(entrepriseId);

  const [mode, setMode] = useState<PaletteMode>(2);
  const [selectedId, setSelectedId] = useState<string>(PALETTES_2[0].id);
  const [couleursPerso, setCouleursPerso] = useState<CouleursPerso | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");

  // Préremplit mode + palette sélectionnée à partir de ce qui est déjà en
  // base pour cette entreprise -- une seule fois, quand identiteVisuelle
  // passe de "pas encore chargé" à une valeur (ou change d'entreprise).
  // Technique de rendu plutôt qu'un useEffect (voir useIdentiteVisuelle.ts)
  // pour rester une pure dérivation, sans setState synchrone dans un effet.
  // Si les couleurs enregistrées ne correspondent à aucune palette
  // prédéfinie (édition manuelle), on reconstruit la palette personnalisée.
  const [prevIdentiteVisuelle, setPrevIdentiteVisuelle] = useState(identiteVisuelle);
  if (identiteVisuelle !== prevIdentiteVisuelle) {
    setPrevIdentiteVisuelle(identiteVisuelle);

    if (identiteVisuelle) {
      const savedMode: PaletteMode =
        identiteVisuelle.palette_mode === "3" ? 3 : 2;
      const pool = savedMode === 3 ? PALETTES_3 : PALETTES_2;
      const match = pool.find(
        (p) =>
          p.primary === identiteVisuelle.couleur_primaire &&
          p.background === identiteVisuelle.couleur_fond
      );

      if (match) {
        setMode(savedMode);
        setSelectedId(match.id);
      } else if (
        identiteVisuelle.couleur_primaire &&
        identiteVisuelle.couleur_fond
      ) {
        setMode(savedMode);
        setCouleursPerso({
          primary: identiteVisuelle.couleur_primaire,
          background: identiteVisuelle.couleur_fond,
          accent:
            identiteVisuelle.couleur_accent ?? ACCENTS["corporate-indigo"],
        });
        setSelectedId(PERSO_ID);
      }
    }
  }

  const palettes = useMemo(() => {
    const base = mode === 2 ? PALETTES_2 : PALETTES_3;
    return couleursPerso ? [...base, construirePerso(couleursPerso)] : base;
  }, [mode, couleursPerso]);

  const selectedPalette = useMemo(
    () => palettes.find((p) => p.id === selectedId) ?? palettes[0],
    [palettes, selectedId]
  );

  // Texte du bouton d'aperçu : blanc sauf sur couleur principale claire.
  const primaryBtnTextColor = estClair(selectedPalette.primary)
    ? "#191c1d"
    : "#ffffff";

  /**
   * Modifie une couleur : on part de la palette affichée, on remplace le
   * champ touché, et la palette personnalisée devient la sélection.
   */
  const modifierCouleur = (champ: keyof CouleursPerso, hex: string) => {
    setCouleursPerso({
      primary: selectedPalette.primary,
      background: selectedPalette.background,
      accent:
        selectedPalette.accent ??
        ACCENTS[selectedPalette.id] ??
        selectedPalette.primary,
      [champ]: hex,
    });
    setSelectedId(PERSO_ID);
  };

  const handleAIGenerate = () => {
    if (aiPrompt.trim()) {
      onGenerateWithAI?.(aiPrompt.trim());
    }
  };

  const handleContinue = () => {
    // On ne sauvegarde rien en BD à cette étape : la palette est juste
    // gardée en mémoire (localStorage) le temps de traverser les pages
    // Typographie puis Logo, qui enverront tout d'un coup à la fin.
    // Les clés ci-dessous (mode, primary, background, accent) sont celles
    // que /Logo relira pour construire l'objet envoyé à /api/identite-visuelle.
    if (entrepriseId) {
      localStorage.setItem(
        `identite:${entrepriseId}:palette`,
        JSON.stringify({
          mode,
          primary: selectedPalette.primary,
          background: selectedPalette.background,
          accent: mode === 3 ? selectedPalette.accent : null,
        })
      );
    }

    onContinue?.({ palette: selectedPalette, mode });

    // On précise l'entreprise dans l'URL pour la suite (voir
    // src/hooks/useEntrepriseId.ts : l'URL a priorité sur la détection
    // automatique, utile si le compte a plusieurs entreprises).
    router.push(`/Typographie?entrepriseId=${entrepriseId}`);
  };

  const nomEntreprise = entreprise?.nom || "Nom de votre entreprise";
  const slogan =
    entreprise?.slogan || "Votre slogan apparaîtra ici, sous le nom.";
  const secteur = libelleSecteur(entreprise?.secteur_activite ?? null);

  return (
    <div className="grid grid-cols-1 items-start gap-6 pb-8 xl:grid-cols-[minmax(0,1fr)_320px]">
      {/* Colonne gauche : aperçu */}
      <div className="flex min-w-0 flex-col gap-md xl:sticky xl:top-6">
        <h2 className="text-headline-sm font-headline-sm text-on-surface">
          Aperçu
        </h2>

        <div className="flex min-h-[480px] min-w-0 flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div
            className="flex flex-1 flex-col justify-center px-6 py-10 transition-colors duration-500 lg:px-10"
            style={{ backgroundColor: selectedPalette.background }}
          >
            <div className="flex w-full flex-col gap-5">
              {secteur && (
                <span
                  className="w-fit rounded-md border px-2.5 py-1 text-[12px] font-medium"
                  style={{
                    borderColor: selectedPalette.primary,
                    color: selectedPalette.headingText,
                  }}
                >
                  {secteur}
                </span>
              )}
              <h1
                className="w-full text-3xl font-extrabold leading-tight sm:text-4xl"
                style={{ color: selectedPalette.headingText }}
              >
                {nomEntreprise}
              </h1>
              <p
                className="w-full text-base leading-7 sm:text-lg"
                style={{ color: selectedPalette.bodyText }}
              >
                {slogan}
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <span
                  className="rounded-lg px-6 py-3 text-label-md font-label-md transition-colors duration-500"
                  style={{
                    backgroundColor: selectedPalette.primary,
                    color: primaryBtnTextColor,
                  }}
                >
                  Nous contacter
                </span>
                <span
                  className="rounded-lg border bg-white px-6 py-3 text-label-md font-label-md transition-colors duration-500"
                  style={{
                    borderColor: selectedPalette.primary,
                    color: selectedPalette.headingText,
                  }}
                >
                  En savoir plus
                </span>
                {mode === 3 && selectedPalette.accent && (
                  <span
                    className="h-11 w-11 shrink-0 rounded-lg transition-colors duration-500"
                    style={{ backgroundColor: selectedPalette.accent }}
                    title="Couleur d'accent"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Colonne droite : contrôles */}
      <div className="flex min-w-0 w-full flex-col gap-lg">
        {/* Palettes proposées */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="mb-md flex items-center justify-between gap-2">
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Palettes proposées
            </h3>
            <div
              className="flex rounded-lg bg-surface-container p-1"
              role="group"
              aria-label="Nombre de couleurs"
            >
              {([2, 3] as PaletteMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={mode === m}
                  className={`rounded-md px-3 py-1.5 text-label-sm font-label-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    mode === m
                      ? "bg-white text-on-surface shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {m} couleurs
                </button>
              ))}
            </div>
          </div>

          <div className="stagger-in grid grid-cols-2 gap-3">
            {palettes.map((p) => {
              const isActive = p.id === selectedPalette.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedId(p.id)}
                  aria-pressed={isActive}
                  className={`rounded-lg border-2 p-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isActive
                      ? "border-primary"
                      : "border-surface-variant hover:border-outline-variant"
                  }`}
                >
                  <div className="mb-2 flex h-12 overflow-hidden rounded-md">
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
                    title={p.name}
                    className={`truncate text-center text-label-sm font-label-sm ${
                      isActive ? "text-on-surface" : "text-on-surface-variant"
                    }`}
                  >
                    {p.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ajustements manuels */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <h3 className="text-label-md font-label-md text-on-surface">
            Éditer manuellement les couleurs
          </h3>
          <p className="mb-md mt-1 text-body-sm font-body-sm text-on-surface-variant">
            Partez d&apos;une palette proposée et ajustez chaque couleur.
          </p>
          <div className="flex flex-col gap-3">
            <ColorField
              label="Principale"
              hexValue={selectedPalette.primary}
              onChange={(hex) => modifierCouleur("primary", hex)}
            />
            <ColorField
              label="Fond"
              hexValue={selectedPalette.background}
              onChange={(hex) => modifierCouleur("background", hex)}
            />
            {mode === 3 && selectedPalette.accent && (
              <ColorField
                label="Accent"
                hexValue={selectedPalette.accent}
                onChange={(hex) => modifierCouleur("accent", hex)}
              />
            )}
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
            <h3 className="text-label-md font-label-md font-bold text-on-surface">
              Générer avec l&apos;IA
            </h3>
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
            placeholder="Décrivez l'ambiance de votre marque…"
            exemples={[
              "Une marque de bien-être, tons terreux et doux…",
              "Un cabinet sérieux, bleu profond et gris clair…",
              "Un fast-food énergique, orange et noir…",
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

const HEX_6 = /^#?([0-9a-f]{6})$/i;

/** Ligne « sélecteur de couleur + code hex éditable » des ajustements manuels. */
function ColorField({
  label,
  hexValue,
  onChange,
}: {
  label: string;
  hexValue: string;
  onChange: (hex: string) => void;
}) {
  const id = useId();
  const [brouillon, setBrouillon] = useState(hexValue);

  // Resynchronise le champ texte quand la couleur change ailleurs
  // (choix d'une autre palette, sélecteur natif), sans effet.
  const [prevHex, setPrevHex] = useState(hexValue);
  if (hexValue !== prevHex) {
    setPrevHex(hexValue);
    setBrouillon(hexValue);
  }

  const brouillonValide = HEX_6.test(brouillon.trim());

  const changerTexte = (valeur: string) => {
    setBrouillon(valeur);
    const m = valeur.trim().match(HEX_6);
    if (m) onChange(`#${m[1].toLowerCase()}`);
  };

  return (
    <div className="flex items-center gap-3">
      <label
        htmlFor={`${id}-couleur`}
        className="relative h-11 w-11 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-outline-variant focus-within:ring-2 focus-within:ring-primary/40"
        style={{ backgroundColor: hexValue }}
      >
        <span className="sr-only">{label} : choisir avec le sélecteur</span>
        <input
          id={`${id}-couleur`}
          type="color"
          value={hexValue}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <label
        htmlFor={`${id}-hex`}
        className="min-w-0 flex-1 truncate text-body-sm font-body-sm text-on-surface"
      >
        {label}
      </label>
      <input
        id={`${id}-hex`}
        type="text"
        inputMode="text"
        maxLength={7}
        spellCheck={false}
        value={brouillon}
        onChange={(e) => changerTexte(e.target.value)}
        onBlur={() => {
          if (!brouillonValide) setBrouillon(hexValue);
        }}
        aria-invalid={!brouillonValide || undefined}
        aria-label={`${label}, code hexadécimal`}
        className={`h-11 w-24 shrink-0 rounded-lg border bg-surface-container-low px-2 font-mono text-[13px] uppercase text-on-surface transition-colors focus:bg-white focus:outline-none focus:ring-2 ${
          brouillonValide
            ? "border-border-strong focus:border-primary focus:ring-primary/20"
            : "border-error focus:border-error focus:ring-error/20"
        }`}
      />
    </div>
  );
}
