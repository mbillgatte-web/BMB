"use client";

import { useState } from "react";
import { CATEGORIES, TEMPLATES, type SiteTemplate } from "./templates-data";

/**
 * Construit l'URL d'une vignette placeholder (placehold.co) pour un
 * template donné, en attendant de vraies captures d'écran de templates
 * réels. Format: largeur x hauteur / couleur de fond / couleur de texte.
 */
function thumbnailUrl(template: SiteTemplate, size = "640x400") {
  const label = encodeURIComponent(template.name);
  return `https://placehold.co/${size}/${template.accentColor}/FFFFFF?text=${label}`;
}

export default function TemplateGallery() {
  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORIES)[number]>("Tous");
  const [previewTemplate, setPreviewTemplate] = useState<SiteTemplate | null>(
    null
  );
  // Sélection purement visuelle pour l'instant : l'édition IA du template
  // choisi sera branchée dans une prochaine étape, rien n'est encore
  // envoyé en base ici.
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  const visibleTemplates =
    activeCategory === "Tous"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  const handleChoose = (template: SiteTemplate) => {
    setSelectedTemplateId(template.id);
    setPreviewTemplate(null);
  };

  return (
    <div className="flex flex-col gap-lg">
      {/* En-tête de section */}
      <div className="mb-md">
        <h2 className="mb-xs text-headline-lg font-headline-lg text-on-surface">
          Choisissez un template
        </h2>
        <p className="text-body-md font-body-md text-secondary">
          Parcourez notre galerie et sélectionnez la base de votre site web.
          Vous pourrez ensuite l&apos;adapter à votre identité visuelle avec
          l&apos;IA.
        </p>
      </div>

      {selectedTemplateId && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
          <span className="material-symbols-outlined text-primary">
            check_circle
          </span>
          <p className="font-body-sm text-body-sm text-on-surface">
            Template sélectionné :{" "}
            <span className="font-semibold">
              {TEMPLATES.find((t) => t.id === selectedTemplateId)?.name}
            </span>
            . L&apos;édition avec l&apos;IA sera disponible dans une
            prochaine étape.
          </p>
        </div>
      )}

      {/* Filtre par catégorie */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full px-4 py-2 font-label-sm text-label-sm transition-colors ${
                isActive
                  ? "bg-primary text-white"
                  : "bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary/50 hover:text-primary"
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Grille de templates */}
      <div className="grid grid-cols-1 gap-lg sm:grid-cols-2 xl:grid-cols-3">
        {visibleTemplates.map((template) => {
          const isSelected = template.id === selectedTemplateId;

          return (
            <div
              key={template.id}
              className={`group flex flex-col overflow-hidden rounded-2xl border bg-surface-container-lowest shadow-sm transition-all ${
                isSelected
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-outline-variant hover:shadow-md"
              }`}
            >
              <button
                type="button"
                onClick={() => setPreviewTemplate(template)}
                className="relative block aspect-[16/10] w-full overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl(template)}
                  alt={`Aperçu du template ${template.name}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 font-label-sm text-label-sm text-on-surface shadow-sm">
                  {template.category}
                </span>
                {isSelected && (
                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">
                      check
                    </span>
                  </span>
                )}
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
                    className={`flex-1 rounded-lg px-4 py-2 font-label-md text-label-md transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {isSelected ? "Sélectionné" : "Choisir"}
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
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailUrl(previewTemplate, "1200x675")}
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
                {previewTemplate.category}
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
