"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Eye } from "lucide-react";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase/browser";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { uploaderImageSite } from "@/data/site";
import { CATEGORIES, TEMPLATES, type SiteTemplate } from "./templates-data";
import ChatComposer, { type Raccourci } from "./ChatComposer";
import PublicationSite from "./PublicationSite";

// Exemples qui défilent dans la zone vide, et raccourcis proposés une fois
// la zone dépliée (voir ChatComposer). Adaptés à l'édition d'un modèle.
const EXEMPLES_EDITION = [
  "Remplace les plats par ceux de mon restaurant…",
  "Mets mes horaires du mardi au dimanche…",
  "Change le titre principal…",
  "Ajoute une section sur la livraison…",
];
const RACCOURCIS_EDITION: Raccourci[] = [
  { libelle: "Réécrire les textes", texte: "Réécris les textes pour qu'ils parlent de " },
  { libelle: "Changer les horaires", texte: "Mets les horaires suivants : " },
  { libelle: "Modifier le menu", texte: "Remplace les plats du menu par : " },
  { libelle: "Changer le slogan", texte: "Change le slogan du hero en : " },
];

/**
 * Vignette d'un template. Pour un template opérationnel (templateId), c'est
 * une vraie capture d'écran de son rendu, générée par
 * `npm run templates:capture` (scripts/capture-templates.mjs) dans
 * public/Templates/<id>/preview.png. Pour une simple entrée de catalogue
 * (pas encore de fichiers), on garde un placeholder coloré (placehold.co).
 */
function thumbnailUrl(template: SiteTemplate, size = "640x400") {
  if (template.templateId) return `/Templates/${template.templateId}/preview.png`;
  const label = encodeURIComponent(template.name);
  return `https://placehold.co/${size}/${template.accentColor}/FFFFFF?text=${label}`;
}

/**
 * Ordre d'affichage : les templates opérationnels (avec de vrais fichiers,
 * donc choisissables) d'abord, les entrées « Bientôt disponible » ensuite.
 * Le tri est stable : à disponibilité égale, l'ordre de templates-data.ts
 * est conservé.
 */
function sortAvailableFirst(templates: SiteTemplate[]) {
  return [...templates].sort(
    (a, b) => Number(Boolean(b.templateId)) - Number(Boolean(a.templateId))
  );
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

// Boutons de la galerie et de la modale : 40 px de haut, coins `lg` comme
// les autres contrôles de l'app, texte semi-gras. Le plein violet est
// réservé au geste principal (« Choisir »).
const BTN =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold leading-none " +
  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2";
const BTN_CONTOUR = `${BTN} border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-primary/5 hover:text-primary`;
const BTN_PLEIN = `${BTN} bg-primary text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-on-surface-variant`;

// Pastille de catégorie posée sur une vignette ou un en-tête.
const PASTILLE =
  "inline-flex items-center rounded-md px-2.5 py-1 text-[12px] font-semibold leading-4";

export default function TemplateGallery() {
  // Apparition en cascade des cartes : désactivée si l'utilisateur préfère
  // moins d'animations (prefers-reduced-motion).
  const reduceMotion = useReducedMotion();

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
  const [editing, setEditing] = useState(false);
  const [editError, setEditError] = useState("");
  // L'image "épinglée" au prompt (voir handleAttachImage) : uploadée dès la
  // sélection du fichier (pas au moment d'envoyer le prompt), pour que la
  // vignette de confirmation s'affiche tout de suite. `attachedImageName`
  // sert juste à l'affichage (nom du fichier dans la vignette).
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  // Change à chaque édition réussie -> repasse dans previewUrl() pour forcer
  // l'iframe à recharger le nouveau contenu plutôt qu'une réponse en cache.
  const [refreshToken, setRefreshToken] = useState(0);

  const selectedTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId);

  const visibleTemplates = sortAvailableFirst(
    activeCategory === "Tous"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory)
  );

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

  // Upload immédiat vers le bucket "site-images" dès que l'utilisateur
  // choisit un fichier (même mécanisme que LogoBuilder.tsx pour le bucket
  // "logos") -- l'URL publique obtenue est envoyée à /api/edit-site avec le
  // prompt, pour que l'IA utilise cette VRAIE photo plutôt que d'en réutiliser
  // une du template (voir le commentaire de /api/edit-site).
  const handleAttachImage = async (file: File) => {
    if (!entreprise) {
      setEditError("Sélectionnez une entreprise avant d'épingler une image.");
      return;
    }

    setUploadingImage(true);
    setEditError("");

    let publicUrl: string;
    try {
      publicUrl = await uploaderImageSite(supabase, entreprise.id, file);
    } catch (err) {
      setUploadingImage(false);
      setEditError(`Échec de l'envoi de l'image : ${(err as Error).message}`);
      return;
    }
    setUploadingImage(false);

    setAttachedImageUrl(publicUrl);
    setAttachedImageName(file.name);
  };

  // Envoie le prompt + le HTML actuel du site à Gemini (voir /api/edit-site,
  // qui édite maintenant le HTML complet plutôt qu'un content.json) et
  // sauvegarde le résultat. Le prompt est de nouveau obligatoire : il n'y a
  // plus de "base" à appliquer sans demande précise, l'adaptation à
  // l'entreprise est déjà faite une fois pour toutes à la création.
  const handleEdit = async () => {
    if (!selectedTemplate?.templateId || !entreprise) return;

    if (!prompt.trim()) {
      setEditError("Décrivez ce que vous voulez modifier avant de continuer.");
      return;
    }

    setEditing(true);
    setEditError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setEditing(false);
      setEditError("Vous devez être connecté.");
      return;
    }

    const res = await fetch("/api/edit-site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        entrepriseId: entreprise.id,
        templateId: selectedTemplate.templateId,
        prompt,
        imageUrl: attachedImageUrl,
      }),
    });

    const body = await res.json();

    setEditing(false);

    if (!res.ok) {
      setEditError(body.error ?? "Impossible de modifier le site.");
      return;
    }

    // Force l'iframe à recharger : voir le commentaire de previewUrl().
    // Simple compteur (pas Date.now()) : un événement React ne doit pas
    // appeler de fonction impure, même dans un gestionnaire (règle
    // react-hooks/purity) -- un entier croissant remplit le même rôle.
    setRefreshToken((v) => v + 1);
    setPrompt("");
    setAttachedImageUrl(null);
    setAttachedImageName(null);
  };

  // Filet de sécurité pour handleEdit : reconstruit le site exactement comme
  // au premier "Choisir" (voir /api/reset-site), effaçant les éditions IA --
  // utile si un enchaînement de corrections dans le chat devient confus.
  const handleReset = async () => {
    if (!selectedTemplate?.templateId || !entreprise) return;

    if (
      !window.confirm(
        "Repartir du template d'origine ? Toutes les modifications faites avec l'IA sur ce site seront perdues."
      )
    ) {
      return;
    }

    setEditing(true);
    setEditError("");

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setEditing(false);
      setEditError("Vous devez être connecté.");
      return;
    }

    const res = await fetch("/api/reset-site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        entrepriseId: entreprise.id,
        templateId: selectedTemplate.templateId,
      }),
    });

    const body = await res.json();

    setEditing(false);

    if (!res.ok) {
      setEditError(body.error ?? "Impossible de réinitialiser le site.");
      return;
    }

    setRefreshToken((v) => v + 1);
  };

  // --- Un template est choisi -> aperçu en grand + prompt d'édition IA ----
  // Même principe que VisualGenerator : la galerie disparaît au profit d'un
  // écran dédié. On exige templateId (des vrais fichiers derrière) car cet
  // écran est construit autour de l'aperçu réel ; les entrées de catalogue
  // sans fichiers ne sont de toute façon pas sélectionnables.
  if (selectedTemplate?.templateId) {
    const url = previewUrl(
      selectedTemplate.templateId,
      entreprise?.id,
      refreshToken
    );

    return (
      <div className="flex flex-col gap-lg">
        <button
          type="button"
          onClick={() => setSelectedTemplateId(null)}
          className="flex w-fit items-center gap-1 text-[14px] font-semibold text-on-surface transition-colors hover:text-primary"
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
            <span className={cn(PASTILLE, "bg-primary/10 text-primary")}>
              {selectedTemplate.category}
            </span>
          </div>
          <p className="max-w-[60ch] text-[15px] leading-6 text-on-surface">
            Voici votre site avec votre identité visuelle appliquée. Décrivez
            les modifications souhaitées à l&apos;IA pour l&apos;adapter à
            votre activité.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-xl lg:grid-cols-[1fr_360px]">
          {/* Aperçu en direct du site */}
          <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            <div className="flex items-center justify-between border-b border-outline-variant px-lg py-3">
              <span className="text-[14px] font-semibold text-on-surface">
                Aperçu en direct
              </span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[13px] font-semibold text-on-surface transition-colors hover:text-primary"
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
              <h3 className="mb-3 text-[15px] font-bold text-on-surface">
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
                    <span className="text-[14px] leading-5 text-on-surface">
                      Couleur principale appliquée
                    </span>
                  </div>
                  <p className="text-[14px] leading-5 text-on-surface">
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
                      <span className="text-[14px] leading-5 text-on-surface">
                        Logo détecté
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-[14px] leading-[21px] text-on-surface-variant">
                  Aucune identité visuelle configurée — l&apos;aperçu utilise
                  les couleurs et polices d&apos;origine du template.
                  Configurez la palette, la typographie et le logo depuis
                  &quot;Identité visuelle&quot; pour un rendu personnalisé.
                </p>
              )}
            </div>

            {/* Mise en ligne du site à /s/<slug> (voir PublicationSite.tsx).
                refreshToken change après chaque édition IA / réinitialisation
                pour que le bloc sache qu'il y a du nouveau à republier. */}
            <PublicationSite
              entrepriseId={entreprise?.id}
              templateId={selectedTemplate.templateId!}
              refreshToken={refreshToken}
            />

            {/* Même composeur que le générateur de site par IA
                (ChatComposer) : zone qui se déplie, exemples animés, image
                jointe, dictée et raccourcis. Envoi = handleEdit. */}
            <div>
              <p className="mb-2 text-[15px] font-bold text-on-surface">
                Que voulez-vous modifier ?
              </p>
              <ChatComposer
                value={prompt}
                onChange={setPrompt}
                onSubmit={handleEdit}
                disabled={editing}
                exemples={EXEMPLES_EDITION}
                raccourcis={RACCOURCIS_EDITION}
                onJoindre={handleAttachImage}
                envoiPieceJointe={uploadingImage}
                pieceJointe={
                  attachedImageUrl && attachedImageName
                    ? { url: attachedImageUrl, nom: attachedImageName }
                    : null
                }
                onRetirerPieceJointe={() => {
                  setAttachedImageUrl(null);
                  setAttachedImageName(null);
                }}
              />
              <p className="mt-2 px-2 text-center text-[11px] text-outline">
                {editing
                  ? "Modification en cours…"
                  : uploadingImage
                    ? "Envoi de l'image…"
                    : "Entrée pour envoyer · Maj + Entrée pour aller à la ligne"}
              </p>
            </div>

            {editError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 font-body-sm text-body-sm text-red-800">
                {editError}
              </p>
            )}

            <button
              type="button"
              onClick={handleReset}
              disabled={editing}
              className="text-center text-[14px] font-medium text-on-surface-variant underline-offset-2 transition-colors hover:text-red-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              Réinitialiser au template d&apos;origine
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Galerie : tous les templates, filtrables par catégorie ------------
  return (
    <div className="flex flex-col gap-lg">
      {/* En-tête de section */}
      <div>
        <h2 className="mb-xs text-headline-lg font-headline-lg text-on-surface">
          Choisissez un template
        </h2>
        <p className="max-w-[60ch] text-[15px] leading-6 text-on-surface">
          Parcourez la galerie et sélectionnez la base de votre site web. Vous
          pourrez ensuite l&apos;adapter à votre identité visuelle avec
          l&apos;IA.
        </p>
      </div>

      {chooseError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
          <span className="material-symbols-outlined text-red-600">error</span>
          <p className="text-[14px] font-medium text-red-800">{chooseError}</p>
        </div>
      )}

      {/* Filtre par catégorie : pilules de 36 px, filtre actif en violet
          plein, les autres en contour sombre. */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
        {CATEGORIES.map((category) => {
          const isActive = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex h-9 items-center rounded-full border px-4 text-[13px] font-semibold leading-none transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2",
                isActive
                  ? "border-primary bg-primary text-white"
                  : "border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:text-primary"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Grille de templates : chaque carte arrive en cascade (motion). La
          clé de la grille change avec le filtre pour rejouer l'animation. */}
      <div
        key={activeCategory}
        className="grid grid-cols-1 gap-lg sm:grid-cols-2 xl:grid-cols-3"
      >
        {visibleTemplates.map((template, index) => {
          const isAvailable = Boolean(template.templateId);

          return (
            <motion.article
              key={template.id}
              initial={reduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: Math.min(index, 8) * 0.06,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              className={cn(
                "group flex flex-col overflow-hidden rounded-xl border bg-surface-container-lowest",
                "transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)]",
                isAvailable
                  ? "border-outline-variant hover:-translate-y-1 hover:border-outline hover:shadow-[0_16px_32px_-16px_rgba(27,27,35,0.28)]"
                  : "border-dashed border-outline-variant bg-surface-container-low"
              )}
            >
              <button
                type="button"
                onClick={() => setPreviewTemplate(template)}
                aria-label={`Aperçu rapide de ${template.name}`}
                className="relative block aspect-[16/10] w-full overflow-hidden border-b border-outline-variant bg-surface-container focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl(template)}
                  alt={`Aperçu du template ${template.name}`}
                  loading="lazy"
                  className={cn(
                    "h-full w-full object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.04]",
                    !isAvailable && "opacity-90"
                  )}
                />
                <span
                  className={cn(
                    PASTILLE,
                    "absolute left-3 top-3 border border-black/5 bg-white/95 text-on-surface shadow-sm"
                  )}
                >
                  {template.category}
                </span>
                {!isAvailable && (
                  <span
                    className={cn(
                      PASTILLE,
                      "absolute bottom-3 left-3 bg-on-surface text-white"
                    )}
                  >
                    Bientôt disponible
                  </span>
                )}
                {/* Voile + invite au survol : un seul appel, lisible. */}
                <span className="absolute inset-0 flex items-center justify-center bg-on-surface/0 opacity-0 transition-all duration-300 group-hover:bg-on-surface/45 group-hover:opacity-100">
                  <span className="flex translate-y-1 items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-[14px] font-semibold text-on-surface shadow-md transition-transform duration-300 group-hover:translate-y-0">
                    <Eye className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                    Aperçu rapide
                  </span>
                </span>
              </button>

              <div className="flex flex-1 flex-col gap-2 p-md pt-4">
                <h3 className="text-[17px] font-bold leading-6 text-on-surface">
                  {template.name}
                </h3>
                <p className="flex-1 text-[14px] leading-[21px] text-on-surface">
                  {template.description}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(template)}
                    className={BTN_CONTOUR}
                  >
                    Prévisualiser
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChoose(template)}
                    disabled={!isAvailable || choosing}
                    title={isAvailable ? undefined : "Bientôt disponible"}
                    className={BTN_PLEIN}
                  >
                    {choosing ? "Un instant…" : "Choisir"}
                  </button>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>

      {visibleTemplates.length === 0 && (
        <p className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg text-center text-[15px] text-on-surface">
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
              className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* flex-wrap : sur un téléphone, les actions passent sous le
                  titre au lieu de l'écraser à zéro largeur. */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant px-4 py-3 sm:px-lg">
                <div className="flex min-w-0 items-center gap-3">
                  <h3 className="truncate text-[18px] font-bold text-on-surface">
                    {previewTemplate.name}
                  </h3>
                  <span className={cn(PASTILLE, "shrink-0 bg-primary/10 text-primary")}>
                    {previewTemplate.category}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleChoose(previewTemplate)}
                    disabled={choosing}
                    className={BTN_PLEIN}
                  >
                    {choosing ? "Un instant…" : "Choisir ce template"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    aria-label="Fermer l'aperçu"
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
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
              className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden border-b border-outline-variant">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumbnailUrl(previewTemplate, "1200x675")}
                  alt={`Aperçu du template ${previewTemplate.name}`}
                  className="h-full w-full object-cover object-top"
                />
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(null)}
                  aria-label="Fermer l'aperçu"
                  className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 text-on-surface shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
              </div>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-lg">
                <span className={cn(PASTILLE, "w-fit bg-primary/10 text-primary")}>
                  {previewTemplate.category}
                </span>
                <h3 className="text-[22px] font-bold leading-7 text-on-surface">
                  {previewTemplate.name}
                </h3>
                <p className="text-[15px] leading-6 text-on-surface">
                  {previewTemplate.description}
                </p>
                <p className="text-[14px] font-medium text-on-surface-variant">
                  Aperçu réel bientôt disponible pour ce template.
                </p>

                <div className="mt-4 flex items-center justify-end gap-3 border-t border-outline-variant pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewTemplate(null)}
                    className={BTN_CONTOUR}
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
