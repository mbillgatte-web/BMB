"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const STYLE_TAGS = [
  "Minimaliste",
  "Géométrique",
  "Vintage",
  "Typographique",
  "Moderne",
  "Ludique",
] as const;

interface LogoBuilderProps {
  /** Appelé quand un fichier logo valide est importé (drag & drop ou input) */
  onLogoUploaded?: (file: File) => void;
  /** Appelé quand l'utilisateur clique sur "Générer" */
  onGenerateWithAI?: (prompt: string, selectedStyles: string[]) => void;
}

export default function LogoBuilder({
  onLogoUploaded,
  onGenerateWithAI,
}: LogoBuilderProps) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "Minimaliste",
    "Géométrique",
  ]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Génère et nettoie l'URL d'aperçu à chaque changement de fichier
  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!file.type.startsWith("image/") && file.type !== "image/svg+xml") {
        return; // on ignore silencieusement les types non-image ; branche un toast si besoin
      }
      setLogoFile(file);
      onLogoUploaded?.(file);
    },
    [onLogoUploaded]
  );

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const toggleStyle = (style: string) => {
    setSelectedStyles((prev) =>
      prev.includes(style)
        ? prev.filter((s) => s !== style)
        : [...prev, style]
    );
  };

  const handleAIGenerate = () => {
    if (aiPrompt.trim()) {
      onGenerateWithAI?.(aiPrompt.trim(), selectedStyles);
    }
  };

  return (
    <div className="flex flex-col gap-lg">
      {/* En-tête de section */}
      <div className="mb-md">
        <h2 className="mb-xs text-headline-lg font-headline-lg text-on-surface">
          Création de Logo
        </h2>
        <p className="text-body-md font-body-md text-secondary">
          Définissez l&apos;identité visuelle centrale de votre marque.
          Importez un logo existant ou générez-en un avec l&apos;IA.
        </p>
      </div>

      <div className="grid flex-grow grid-cols-1 gap-xl lg:grid-cols-2">
        {/* Colonne gauche : aperçu live */}
        <div className="flex min-w-0 flex-col gap-md">
          <h3 className="text-headline-sm font-headline-sm text-on-surface">
            Aperçu en direct
          </h3>
          <div className="relative flex h-full flex-col gap-lg overflow-hidden rounded-xl border border-outline-variant bg-surface p-lg shadow-sm">
            <div
              className="pointer-events-none absolute inset-0 opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(var(--outline, #777587) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />

            {/* Mockup 1 : carte de visite */}
            <div className="relative -rotate-2 transform rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-md shadow-sm transition-transform duration-300 hover:rotate-0">
              <div className="mb-2 text-xs text-secondary">
                Carte de visite
              </div>
              <div className="flex items-center gap-md">
                <LogoMark previewUrl={logoPreviewUrl} sizeClassName="h-12 w-12" iconSize={24} />
                <div>
                  <div className="mb-1 h-3 w-24 rounded bg-surface-variant" />
                  <div className="h-2 w-16 rounded bg-surface-variant" />
                </div>
              </div>
            </div>

            {/* Mockup 2 : header d'app mobile */}
            <div className="relative mx-auto w-2/3 translate-y-4 transform overflow-hidden rounded-[2rem] border-4 border-surface-container-high bg-surface-container-lowest p-md shadow-md transition-transform duration-300 hover:translate-y-0">
              <div className="mb-4 text-center text-xs text-secondary">
                Application Mobile
              </div>
              <div className="absolute left-1/2 top-0 h-4 w-1/3 -translate-x-1/2 rounded-b-xl bg-surface-container-high" />
              <div className="mb-6 mt-2 flex items-center justify-between">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  menu
                </span>
                <div className="flex items-center gap-2">
                  <LogoMark previewUrl={logoPreviewUrl} sizeClassName="h-6 w-6" iconSize={14} />
                  <span className="text-label-sm font-label-sm font-bold">
                    Studio
                  </span>
                </div>
                <div className="h-6 w-6 rounded-full bg-surface-variant" />
              </div>
              <div className="space-y-3">
                <div className="h-24 w-full rounded-lg bg-surface-container" />
                <div className="h-12 w-full rounded-lg bg-surface-container" />
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite : actions */}
        <div className="flex min-w-0 flex-col gap-lg">
          {/* Carte 1 : import */}
          <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface p-lg shadow-sm">
            <div className="mb-xs flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary">
                upload_file
              </span>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">
                Importer votre logo
              </h3>
            </div>
            <p className="text-body-sm font-body-sm text-secondary">
              Format recommandé : SVG pour la meilleure qualité, ou PNG
              transparent (min. 512x512px).
            </p>

            {/* Zone de drag & drop */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingOver(true);
              }}
              onDragLeave={() => setIsDraggingOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-xl text-center transition-all ${
                isDraggingOver
                  ? "border-primary bg-surface-container-low"
                  : "border-outline-variant bg-surface-bright hover:border-primary hover:bg-surface-container-low"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.svg"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              <div className="mb-md flex h-16 w-16 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
                <span className="material-symbols-outlined text-secondary text-[32px] group-hover:text-on-primary-container">
                  cloud_upload
                </span>
              </div>
              {logoFile ? (
                <p className="mb-1 truncate text-label-md font-label-md text-on-surface">
                  {logoFile.name}
                </p>
              ) : (
                <p className="mb-1 text-label-md font-label-md text-on-surface">
                  Glissez et déposez votre fichier ici
                </p>
              )}
              <p className="mb-md text-body-sm font-body-sm text-secondary">
                ou cliquez pour parcourir
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="rounded-lg border border-outline-variant bg-white px-md py-sm text-label-md font-label-md text-on-surface transition-colors group-hover:border-primary"
              >
                Sélectionner un fichier
              </button>
            </div>
          </div>

          {/* Séparateur */}
          <div className="flex items-center gap-md opacity-60">
            <div className="h-px flex-grow bg-outline-variant" />
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-secondary">
              ou
            </span>
            <div className="h-px flex-grow bg-outline-variant" />
          </div>

          {/* Carte 2 : génération IA */}
          <div className="relative flex flex-col gap-md overflow-hidden rounded-xl border border-outline-variant bg-surface p-lg shadow-sm">
            <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-primary-container/10 blur-2xl" />
            <div className="relative z-10 mb-xs flex items-center gap-sm">
              <span
                className="material-symbols-outlined text-primary-container"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">
                Générer avec l&apos;IA
              </h3>
            </div>
            <p className="relative z-10 text-body-sm font-body-sm text-secondary">
              Décrivez le concept de votre marque, les éléments clés, et le
              style souhaité (ex: minimaliste, vintage, typographique).
            </p>
            <div className="relative z-10 flex flex-col gap-sm">
              <label className="sr-only" htmlFor="ai-prompt">
                Description du logo
              </label>
              <textarea
                id="ai-prompt"
                rows={3}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Ex: Un logo minimaliste pour un café artisanal, avec une ligne continue formant une tasse et un grain de café, style moderne, couleurs chaudes..."
                className="w-full resize-none rounded-lg border border-outline-variant bg-white p-md text-body-md font-body-md text-on-surface focus:border-primary focus:ring focus:ring-primary/20"
              />

              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div className="flex flex-wrap gap-xs">
                  {STYLE_TAGS.map((style) => {
                    const isSelected = selectedStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleStyle(style)}
                        className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium transition-colors ${
                          isSelected
                            ? "bg-primary-container text-on-primary-container"
                            : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                        }`}
                      >
                        {style}
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={!aiPrompt.trim()}
                  className="flex shrink-0 items-center gap-xs rounded-lg bg-primary-container px-lg py-sm text-label-md font-label-md text-on-primary-container shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    magic_button
                  </span>
                  Générer
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cercle affichant soit le logo importé, soit une icône placeholder */
function LogoMark({
  previewUrl,
  sizeClassName,
  iconSize,
}: {
  previewUrl: string | null;
  sizeClassName: string;
  iconSize: number;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-container text-on-primary-container shadow-inner ${sizeClassName}`}
    >
      {previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Logo importé"
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <span
          className="material-symbols-outlined"
          style={{ fontSize: iconSize }}
        >
          rocket_launch
        </span>
      )}
    </div>
  );
}
