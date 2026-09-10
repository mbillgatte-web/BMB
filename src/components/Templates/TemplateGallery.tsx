"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
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

/**
 * URL de l'aperçu réel d'un template (HTML rendu par renderSiteTemplate.ts).
 * `entrepriseId` est optionnel : sans lui la route retombe sur le style
 * d'origine du template au lieu de l'identité visuelle de l'entreprise.
 * `refreshToken`, s'il change, force le navigateur à refaire la requête au
 * lieu de réutiliser une réponse déjà en cache -- utilisé après une édition
 * IA pour que l'iframe affiche bien le nouveau contenu.
 */
function previewUrl(
  templateId: string,
  entrepriseId?: string,
  refreshToken?: number
) {
  const params = new URLSearchParams();
  if (entrepriseId) params.set("entrepriseId", entrepriseId);
  if (refreshToken) params.set("v", String(refreshToken));
  const query = params.toString();
  return `/api/site-preview/${templateId}${query ? `?${query}` : ""}`;
}

export default function TemplateGallery() {
  // Pour que l'aperçu réel (iframe /api/site-preview) montre les couleurs
  // et polices déjà configurées par l'entreprise, pas seulement le style
  // par défaut du template.
  const { entreprise } = useEntreprise();
  // Sert uniquement à AFFICHER ce qui sera appliqué au template dans l'écran
  // d'édition : l'aperçu lui-même relit l'identité côté serveur à partir de
  // entrepriseId (voir /api/site-preview), il ne la reçoit pas d'ici.
  const { identiteVisuelle } = useIdentiteVisuelle(entreprise?.id ?? null);

  const [activeCategory, setActiveCategory] =
    useState<(typeof CATEGORIES)[number]>("Tous");
  const [previewTemplate, setPreviewTemplate] = useState<SiteTemplate | null>(
    null
  );
  // Une fois choisi, ce template a une ligne dans la table "site" (créée par
  // /api/site) : c'est CE contenu (potentiellement déjà modifié par l'IA)
  // que l'écran d'édition prévisualise, pas juste le state local.
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [prompt, setPrompt] = useState("");
  const [choosing, setChoosing] = useState(false);
  const [chooseError, setChooseError] = useState("");

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId);

  const visibleTemplates =
    activeCategory === "Tous"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  const handleChoose = async (template: SiteTemplate) => {
    if (!template.templateId) return;

    if (!entreprise) {
      setChooseError("Sélectionnez une entreprise avant de choisir un template.");
      return;
    }

    setChoosing(true);
    setChooseError("");

    // Même mécanisme que EntrepriseForm.tsx / LogoBuilder.tsx : le jeton de
    // l'utilisateur connecté, nécessaire pour que la policy RLS de "site"
    // (site_insert_own) accepte la création de la ligne.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setChoosing(false);
      setChooseError("Vous devez être connecté.");
      return;
    }

    const res = await fetch("/api/site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        entrepriseId: entreprise.id,
        templateId: template.templateId,
      }),
    });

    const body = await res.json();

    setChoosing(false);

    if (!res.ok) {
      setChooseError(body.error ?? "Impossible de choisir ce template.");
      return;
    }

    setSelectedTemplateId(template.id);
    setPreviewTemplate(null);
  };

  // --- Un template est choisi -> aperçu en grand + prompt d'édition IA ----
  // Même principe que VisualGenerator : la galerie disparaît au profit d'un
  // écran dédié. On exige templateId (des vrais fichiers derrière) car cet
  // écran est construit autour de l'aperçu réel ; les entrées de catalogue
  // sans fichiers ne sont de toute façon pas sélectionnables.
  if (selectedTemplate?.templateId) {
    const url = previewUrl(selectedTemplate.templateId, entreprise?.id);

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

        <div>
          <div className="mb-xs flex items-center gap-3">
            <h2 className="text-headline-lg font-headline-lg text-on-surface">
              {selectedTemplate.name}
            </h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 font-label-sm text-label-sm text-primary">
              {selectedTemplate.category}
            </span>
          </div>
          <p className="text-body-md font-body-md text-secondary">
            Voici votre site avec votre identité visuelle appliquée. Décrivez
            les modifications souhaitées à l&apos;IA pour l&apos;adapter à
            votre activité.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_360px]">
          {/* Aperçu en direct du site */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant px-lg py-3">
              <span className="font-label-md text-label-md text-on-surface">
                Aperçu en direct
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-primary"
              >
                <span className="material-symbols-outlined text-[16px]">
                  open_in_new
                </span>
                Ouvrir en plein écran
              </a>
            </div>

            {/* Le site est conçu pour occuper toute une fenêtre : on lui
                donne une hauteur généreuse et son propre défilement plutôt
                que de l'écraser dans un ratio fixe comme les visuels. */}
            <iframe
              src={url}
              title={`Aperçu en direct de ${selectedTemplate.name}`}
              className="h-[70vh] min-h-[520px] w-full border-0 bg-white"
            />
          </div>

          {/* Panneau identité + prompt d'édition */}
          <div className="flex flex-col gap-lg">
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <h3 className="mb-3 font-label-md text-label-md text-on-surface">
                Identité de {entreprise?.nom ?? "votre entreprise"}
              </h3>

              {identiteVisuelle ? (
                <div className="flex flex-col gap-3">
                  {/* Seuls la couleur primaire et les 2 polices sont
                      réellement injectées dans le template (voir
                      buildStyleData dans renderSiteTemplate.ts) : on
                      n'affiche donc pas fond/accent ici, pour ne pas
                      laisser croire qu'ils agissent sur l'aperçu. */}
                  <div className="flex items-center gap-2">
                    <span
                      className="h-7 w-7 rounded-full border border-outline-variant shadow-sm"
                      style={{
                        backgroundColor:
                          identiteVisuelle.couleur_primaire ?? undefined,
                      }}
                      title={identiteVisuelle.couleur_primaire ?? undefined}
                    />
                    <span className="font-body-sm text-body-sm text-secondary">
                      Couleur principale appliquée
                    </span>
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
                  Aucune identité visuelle configurée — l&apos;aperçu utilise
                  les couleurs et polices d&apos;origine du template.
                  Configurez la palette, la typographie et le logo depuis
                  &quot;Identité visuelle&quot; pour un rendu personnalisé.
                </p>
              )}
            </div>

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-sm">
              <label
                htmlFor="site-prompt"
                className="mb-2 block font-label-md text-label-md text-on-surface"
              >
                Que voulez-vous modifier ?
              </label>
              <textarea
                id="site-prompt"
                rows={6}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Remplace le contenu par celui de mon restaurant avec des plats comme le eru et l'okok, et des horaires du mardi au dimanche..."
                className="w-full resize-none rounded-lg border border-outline-variant bg-white p-3 text-body-sm font-body-sm placeholder:text-secondary focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="button"
              disabled
              title="Bientôt disponible : édition du site par IA"
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-label-md text-label-md text-white shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">
                auto_awesome
              </span>
              Modifier avec l&apos;IA
            </button>
            <p className="text-center font-body-sm text-body-sm text-outline">
              L&apos;édition du contenu par IA arrive dans une prochaine
              étape.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- Galerie : tous les templates, filtrables par catégorie ------------
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

      {chooseError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <p className="font-body-sm text-body-sm text-red-800">{chooseError}</p>
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
          const isAvailable = Boolean(template.templateId);

          return (
            <div
              key={template.id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:shadow-md"
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
                {!isAvailable && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 font-label-sm text-label-sm text-white">
                    Bientôt disponible
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
                    disabled={!isAvailable || choosing}
                    title={isAvailable ? undefined : "Bientôt disponible"}
                    className="flex-1 rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {choosing ? "..." : "Choisir"}
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

      {/* Modale de prévisualisation -- aperçu réel (iframe sur /api/site-preview)
          si le template a de vrais fichiers derrière, sinon vignette + description
          comme avant (voir templates-data.ts pour templateId). */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          {previewTemplate.templateId ? (
            <div
              className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-outline-variant px-lg py-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    {previewTemplate.name}
                  </h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-label-sm text-label-sm text-primary">
                    {previewTemplate.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleChoose(previewTemplate)}
                    className="rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-white transition-colors hover:bg-primary/90"
                  >
                    Choisir ce template
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    aria-label="Fermer l'aperçu"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      close
                    </span>
                  </button>
                </div>
              </div>

              {/* Aperçu réel : le vrai HTML rendu (contenu + identité de
                  l'entreprise si elle est déjà configurée), pas une image. */}
              <iframe
                src={previewUrl(previewTemplate.templateId, entreprise?.id)}
                title={`Aperçu en direct de ${previewTemplate.name}`}
                className="h-full w-full flex-1 border-0"
              />
            </div>
          ) : (
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
                <p className="font-body-sm text-body-sm text-outline">
                  Aperçu réel bientôt disponible pour ce template.
                </p>

                <div className="mt-4 flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    className="rounded-lg border border-outline-variant px-5 py-2.5 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container-high"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
