"use client";

import { useState } from "react";
import { Loader2, Download, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import {
  VISUAL_FORMATS,
  buildVisualImages,
  type VisualImage,
} from "./visuels-data";
import { PortfolioGallery } from "./PortfolioGallery";

const ALL = "Tous";

interface VisualGeneratorProps {
  /** { [formatId]: chemins d'images }, calculé côté serveur (voir Visuels/page.tsx). */
  imagesByCategory: Record<string, string[]>;
}

/** Le format (dimensions, ratio, nom...) auquel appartient une image donnée. */
function formatOf(image: VisualImage) {
  return VISUAL_FORMATS.find((f) => f.id === image.formatId)!;
}

export default function VisualGenerator({
  imagesByCategory,
}: VisualGeneratorProps) {
  // L'entreprise du compte connecté (et son identité visuelle déjà
  // configurée, si elle existe) : sert à préremplir le générateur avec le
  // vrai nom/logo/couleurs/polices plutôt que de laisser l'IA deviner.
  const { entreprise } = useEntreprise();
  const { identiteVisuelle } = useIdentiteVisuelle(entreprise?.id ?? null);

  const images = buildVisualImages(imagesByCategory);

  const [activeCategory, setActiveCategory] = useState<string>(ALL);
  const [previewImage, setPreviewImage] = useState<VisualImage | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState("");

  const selectedImage = images.find((img) => img.id === selectedImageId);

  const visibleImages =
    activeCategory === ALL
      ? images
      : images.filter((img) => img.formatId === activeCategory);

  const handleChoose = (image: VisualImage) => {
    setSelectedImageId(image.id);
    setPreviewImage(null);
    // Repart d'un état propre : sinon le résultat/l'erreur d'une
    // génération précédente resterait affiché sur la nouvelle image choisie.
    setGeneratedImage(null);
    setGenerationError("");
  };

  const handleGenerate = async () => {
    if (!selectedImage) return;
    const format = formatOf(selectedImage);

    setGenerating(true);
    setGenerationError("");
    setGeneratedImage(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setGenerating(false);
      setGenerationError("Vous devez être connecté.");
      return;
    }

    try {
      const res = await fetch("/api/generate-visual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          templateSrc: selectedImage.src,
          prompt,
          formatName: format.name,
          formatDimensions: format.dimensions,
          entrepriseNom: entreprise?.nom ?? null,
          couleurPrimaire: identiteVisuelle?.couleur_primaire ?? null,
          couleurFond: identiteVisuelle?.couleur_fond ?? null,
          couleurAccent: identiteVisuelle?.couleur_accent ?? null,
          policeTitre: identiteVisuelle?.police_titre ?? null,
          policeTexte: identiteVisuelle?.police_texte ?? null,
          logoUrl: identiteVisuelle?.logo_url ?? null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGenerationError(data.error ?? "Échec de la génération.");
        return;
      }

      setGeneratedImage(data.imageDataUrl);
    } catch {
      setGenerationError("Impossible de contacter le serveur. Réessaie.");
    } finally {
      setGenerating(false);
    }
  };

  // --- Une image est choisie -> résumé identité + génération ------------
  if (selectedImage) {
    const format = formatOf(selectedImage);

    return (
      <div className="flex flex-col gap-lg">
        <button
          type="button"
          onClick={() => setSelectedImageId(null)}
          className="flex w-fit items-center gap-1 font-label-md text-label-md text-on-surface-variant transition-colors hover:text-primary"
        >
          <span className="material-symbols-outlined text-[18px]">
            arrow_back
          </span>
          Retour à la galerie
        </button>

        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_360px]">
          {/* Aperçu de l'image choisie -- object-contain (pas object-cover) :
              ces images viennent du web et ne respectent pas forcément le
              ratio théorique du format (210/297, 1200/628...), un recadrage
              "cover" en coupait donc une partie de façon imprévisible.
              self-start : sans hauteur fixe (plus d'aspect-ratio), la grille
              parente (align-items: stretch par défaut) étirerait sinon ce
              conteneur pour matcher la hauteur du panneau de droite.
              w-full (pas w-auto) : beaucoup de ces images ont une résolution
              native modeste -- w-auto les affichait à leur taille en pixels
              réelle, minuscule dans la colonne. w-full les fait remplir la
              largeur disponible ; max-h plafonne les formats très hauts.
              max-w-[32rem] (pas max-w-lg) : max-w-lg est cassé dans ce
              projet (voir la note dans tailwind.config.ts) -- valeur
              arbitraire pour contourner le conflit plutôt que d'en dépendre. */}
          <div className="flex w-full max-w-[32rem] items-center justify-center self-start overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage.src}
              alt={`Visuel ${format.name}`}
              className="max-h-[600px] w-full rounded-lg object-contain"
            />
          </div>

          {/* Panneau identité + génération */}
          <div className="flex flex-col gap-lg">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <h3 className="mb-1 font-headline-sm text-headline-sm text-on-surface">
                {format.name}
              </h3>
              <p className="mb-4 font-body-sm text-body-sm text-secondary">
                {format.dimensions}
              </p>

              <h4 className="mb-3 font-label-md text-label-md text-on-surface">
                Identité de {entreprise?.nom ?? "votre entreprise"}
              </h4>

              {identiteVisuelle ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {[
                      { label: "Primaire", hex: identiteVisuelle.couleur_primaire },
                      { label: "Fond", hex: identiteVisuelle.couleur_fond },
                      { label: "Accent", hex: identiteVisuelle.couleur_accent },
                    ]
                      .filter((swatch) => swatch.hex)
                      .map((swatch) => (
                        <div key={swatch.label} className="flex flex-col items-center gap-1">
                          <span
                            className="h-7 w-7 rounded-full border border-outline-variant shadow-sm"
                            style={{ backgroundColor: swatch.hex ?? undefined }}
                          />
                          <span className="font-body-sm text-[11px] text-secondary">
                            {swatch.label}
                          </span>
                        </div>
                      ))}
                  </div>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Titres : {identiteVisuelle.police_titre ?? "—"}
                    <br />
                    Texte : {identiteVisuelle.police_texte ?? "—"}
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
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-label-md text-label-md text-white shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <span className="material-symbols-outlined text-[20px]">
                  auto_awesome
                </span>
              )}
              {generating ? "Génération en cours..." : "Générer le visuel"}
            </button>
            {generationError && (
              <p className="text-center font-body-sm text-body-sm text-error">
                {generationError}
              </p>
            )}
          </div>
        </div>

        {/* Résultat de la génération */}
        {generatedImage && (
          <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
            <h3 className="font-label-md text-label-md text-on-surface">
              Visuel généré
            </h3>
            <div className="flex w-full items-center justify-center overflow-hidden rounded-2xl border border-outline-variant bg-white p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={generatedImage}
                alt={`Visuel ${format.name} généré par IA`}
                className="max-h-[600px] w-full rounded-lg object-contain"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className="flex items-center gap-2 rounded-lg border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Régénérer
              </button>
              <a
                href={generatedImage}
                download={`visuel-${format.id}.png`}
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-white transition-colors hover:bg-primary/90"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Télécharger
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Galerie : toutes les images, filtrables par catégorie/format ------
  return (
    <div className="flex flex-col gap-lg">
      <PortfolioGallery images={images.slice(0, 10).map((img) => ({
        src: img.src,
        alt: `Visuel ${formatOf(img).name}`,
      }))} />

      <div id="galerie" className="mb-md scroll-mt-6">
        <h2 className="mb-xs text-headline-lg font-headline-lg text-on-surface">
          Générer un visuel
        </h2>
        <p className="text-body-md font-body-md text-secondary">
          Parcourez tous les formats disponibles ou filtrez par catégorie,
          puis choisissez une image de base.
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
        {visibleImages.map((image) => {
          const format = formatOf(image);

          return (
            <div
              key={image.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:shadow-md"
            >
              <button
                type="button"
                onClick={() => setPreviewImage(image)}
                className="relative block w-full overflow-hidden"
                style={{ aspectRatio: format.aspectRatio }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.src}
                  alt={`Visuel ${format.name}`}
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

              <div className="p-3">
                <button
                  type="button"
                  onClick={() => handleChoose(image)}
                  className="w-full rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-white transition-colors hover:bg-primary/90"
                >
                  Choisir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {visibleImages.length === 0 && (
        <p className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg text-center font-body-md text-body-md text-secondary">
          Aucun visuel dans cette catégorie pour le moment. Ajoute des images
          dans{" "}
          <code className="font-mono text-label-sm">
            public/visuels/
            {activeCategory === ALL ? "&lt;categorie&gt;" : activeCategory}/
          </code>
          .
        </p>
      )}
      {/* Modale de prévisualisation */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-[42rem] flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full shrink-0 overflow-hidden"
              style={{ aspectRatio: formatOf(previewImage).aspectRatio }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage.src}
                alt={`Visuel ${formatOf(previewImage).name}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
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
                {formatOf(previewImage).name}
              </span>

              <div className="mt-4 flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-lg border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => handleChoose(previewImage)}
                  className="rounded-lg bg-primary px-5 py-2.5 font-label-md text-label-md text-white transition-colors hover:bg-primary/90"
                >
                  Choisir ce visuel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
