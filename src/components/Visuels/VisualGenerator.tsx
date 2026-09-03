"use client";

import { useState } from "react";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import {
  VISUAL_FORMATS,
  VISUAL_TEMPLATES,
  type VisualTemplate,
} from "./visuels-data";

const ALL = "Tous";

function thumbnailUrl(template: VisualTemplate, size: string) {
  const label = encodeURIComponent(template.name);
  return `https://placehold.co/${size}/${template.accentColor}/FFFFFF?text=${label}`;
}

/** Le format (dimensions, ratio) auquel appartient un template donné. */
function formatOf(template: VisualTemplate) {
  return VISUAL_FORMATS.find((f) => f.id === template.formatId)!;
}

export default function VisualGenerator() {
  // L'entreprise du compte connecté (et son identité visuelle déjà
  // configurée, si elle existe) : sert à préremplir le générateur avec le
  // vrai nom/logo/couleurs/polices plutôt que de laisser l'IA deviner.
  const { entreprise } = useEntreprise();
  const { identiteVisuelle } = useIdentiteVisuelle(entreprise?.id ?? null);

  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [previewTemplate, setPreviewTemplate] =
    useState<VisualTemplate | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [prompt, setPrompt] = useState("");

  const selectedTemplate = VISUAL_TEMPLATES.find(
    (t) => t.id === selectedTemplateId
  );

  const visibleTemplates =
    activeCategory === ALL
      ? VISUAL_TEMPLATES
      : VISUAL_TEMPLATES.filter((t) => t.formatId === activeCategory);

  const handleChoose = (template: VisualTemplate) => {
    setSelectedTemplateId(template.id);
    setPreviewTemplate(null);
  };

  // --- Un template est choisi -> résumé identité + génération ------------
  if (selectedTemplate) {
    const format = formatOf(selectedTemplate);

    return (
      <div className="flex flex-col gap-lg">
        <button
          type="button"
          onClick={() => setSelectedTemplateId(null)}
          className="flex w-fit items-center gap-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Retour à la galerie
        </button>

        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_360px]">
          {/* Aperçu du template choisi */}
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-outline-variant shadow-sm"
            style={{ aspectRatio: format.aspectRatio }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl(selectedTemplate, "800x800")}
              alt={`Aperçu du template ${selectedTemplate.name}`}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Panneau identité + génération */}
          <div className="flex flex-col gap-lg">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <h3 className="mb-3 font-label-md text-label-md text-on-surface">
                Identité de {entreprise?.nom ?? "votre entreprise"}
              </h3>

              {identiteVisuelle ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    {[
                      identiteVisuelle.couleur_primaire,
                      identiteVisuelle.couleur_fond,
                      identiteVisuelle.couleur_accent,
                    ]
                      .filter(Boolean)
                      .map((hex) => (
                        <span
                          key={hex}
                          className="h-7 w-7 rounded-full border border-outline-variant shadow-sm"
                          style={{ backgroundColor: hex ?? undefined }}
                          title={hex ?? undefined}
                        />
                      ))}
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Police : {identiteVisuelle.police_titre ?? "—"} /{" "}
                    {identiteVisuelle.police_texte ?? "—"}
                  </p>
                  {identiteVisuelle.logo_url && (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={identiteVisuelle.logo_url}
                        alt="Logo de l'entreprise"
                        className="h-8 w-8 rounded-full border border-outline-variant object-cover"
                      />
                      <span className="font-body-sm text-body-sm text-secondary">
                        Logo détecté
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="font-body-sm text-body-sm text-secondary">
                  Aucune identité visuelle configurée pour le moment — le
                  visuel sera généré avec un style par défaut. Configurez la
                  palette, la typographie et le logo depuis &quot;Identité
                  visuelle&quot; pour un rendu personnalisé.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <label
                htmlFor="visual-prompt"
                className="mb-2 block font-label-md text-label-md text-on-surface"
              >
                Précisez le contenu (optionnel)
              </label>
              <textarea
                id="visual-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Promotion -20% sur nos plats du jour, valable jusqu'au 15 septembre..."
                className="w-full resize-none rounded-lg border border-outline-variant bg-white p-3 text-body-sm font-body-sm placeholder:text-secondary focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              disabled
              title="Bientôt disponible : génération d'images par IA"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-label-md text-label-md text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                auto_awesome
              </span>
              Générer le visuel
            </button>
            <p className="text-center font-body-sm text-body-sm text-outline">
              La génération d&apos;images par IA arrive dans une prochaine
              étape.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Galerie : tous les templates, filtrables par catégorie/format -----
  return (
    <div className="flex flex-col gap-lg">
      <div className="mb-md">
        <h2 className="mb-xs text-headline-lg font-headline-lg text-on-surface">
          Générer un visuel
        </h2>
        <p className="text-body-md font-body-md text-secondary">
          Parcourez tous les formats disponibles ou filtrez par catégorie,
          puis choisissez un template.
        </p>
      </div>

      {/* Filtre par catégorie (les formats servent de catégories) */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory(ALL)}
          className={`rounded-full px-4 py-2 font-label-sm text-label-sm transition-colors ${
            activeCategory === ALL
              ? "bg-primary text-white"
              : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary/50 hover:text-primary"
          }`}
        >
          {ALL}
        </button>
        {VISUAL_FORMATS.map((format) => {
          const isActive = activeCategory === format.id;
          return (
            <button
              key={format.id}
              type="button"
              onClick={() => setActiveCategory(format.id)}
              className={`rounded-full px-4 py-2 font-label-sm text-label-sm transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary/50 hover:text-primary"
              }`}
            >
              {format.name}
            </button>
          );
        })}
      </div>

      {/* Grille : chaque carte respecte le ratio de SON propre format */}
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 xl:grid-cols-3">
        {visibleTemplates.map((template) => {
          const format = formatOf(template);

          return (
            <div
              key={template.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setPreviewTemplate(template)}
                className="relative block w-full overflow-hidden"
                style={{ aspectRatio: format.aspectRatio }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl(template, "640x640")}
                  alt={`Aperçu du template ${template.name}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-label-sm text-label-sm text-on-surface shadow-sm">
                  {format.name}
                </span>
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/30 group-hover:opacity-100">
                  <span className="rounded-full bg-white px-4 py-2 font-label-md text-label-md text-on-surface shadow-sm">
                    Aperçu rapide
                  </span>
                </span>
              </button>

              <div className="flex flex-1 flex-col gap-2 p-lg">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {template.name}
                </h3>
                <p className="flex-1 text-body-sm font-body-sm text-secondary">
                  {template.description}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1 rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:border-primary hover:text-primary"
                  >
                    Prévisualiser
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChoose(template)}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-white transition-colors hover:bg-primary/90"
                  >
                    Choisir
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibleTemplates.length === 0 && (
        <p className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg text-center font-body-md text-body-md text-secondary">
          Aucun template dans cette catégorie pour le moment.
        </p>
      )}

      {/* Modale de prévisualisation */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full shrink-0 overflow-hidden"
              style={{ aspectRatio: formatOf(previewTemplate).aspectRatio }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl(previewTemplate, "1000x1000")}
                alt={`Aperçu du template ${previewTemplate.name}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                aria-label="Fermer l'aperçu"
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-sm transition-colors hover:bg-white"
              >
                <span className="material-symbols-outlined text-[20px]">
                  close
                </span>
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-xl">
              <span className="w-fit rounded-full bg-primary/10 px-3 py-1 font-label-sm text-label-sm text-primary">
                {formatOf(previewTemplate).name}
              </span>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {previewTemplate.name}
              </h3>
              <p className="font-body-md text-body-md text-secondary">
                {previewTemplate.description}
              </p>

              <div className="mt-4 flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  className="rounded-lg border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => handleChoose(previewTemplate)}
                  className="rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-white transition-colors hover:bg-primary/90"
                >
                  Choisir ce template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
