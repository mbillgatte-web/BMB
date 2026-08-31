
"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  // Id transmis depuis /PaletteColor -> /Typographie -> ici. C'est la
  // dernière étape : on en a besoin pour savoir sur quelle entreprise
  // rattacher l'identité visuelle, et pour relire palette/typographie
  // que les deux pages précédentes ont laissées dans localStorage.
  const entrepriseId = searchParams.get("entrepriseId");

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "Minimaliste",
    "Géométrique",
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        return;
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

  const handleFinish = async () => {
    if (!entrepriseId) {
      setError("Entreprise introuvable, recommence depuis la création d'entreprise.");
      return;
    }

    setSaving(true);
    setError("");

    // Relit ce que PaletteBuilder.tsx et police.tsx ont mis de côté dans
    // localStorage à leurs étapes respectives (rien n'a encore été
    // envoyé en base avant ce point).
    const paletteRaw = localStorage.getItem(`identite:${entrepriseId}:palette`);
    const typographieRaw = localStorage.getItem(
      `identite:${entrepriseId}:typographie`
    );
    const palette = paletteRaw ? JSON.parse(paletteRaw) : null;
    const typographie = typographieRaw ? JSON.parse(typographieRaw) : null;

    let logoUrl: string | null = null;

    if (logoFile) {
      const extension = logoFile.name.split(".").pop() ?? "png";
      // Chemin dans le bucket "logos" : un dossier par entreprise pour
      // éviter les collisions de noms entre utilisateurs.
      const path = `${entrepriseId}/logo.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, logoFile, { upsert: true });

      if (uploadError) {
        setSaving(false);
        setError(`Échec de l'envoi du logo : ${uploadError.message}`);
        return;
      }

      logoUrl = supabase.storage.from("logos").getPublicUrl(path).data.publicUrl;
    }

    // Même mécanisme que EntrepriseForm.tsx : on a besoin du jeton de
    // l'utilisateur connecté pour que la policy RLS de identite_visuelle
    // laisse passer l'insertion côté serveur.
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setSaving(false);
      setError("Vous devez être connecté.");
      return;
    }

    const res = await fetch("/api/identite-visuelle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        entrepriseId,               // -> colonne entreprise_id (clé étrangère)
        paletteMode: palette?.mode ?? null,          // -> palette_mode
        couleurPrimaire: palette?.primary ?? null,   // -> couleur_primaire
        couleurFond: palette?.background ?? null,    // -> couleur_fond
        couleurAccent: palette?.accent ?? null,       // -> couleur_accent
        policeTitre: typographie?.policeTitre ?? null, // -> police_titre
        policeTexte: typographie?.policeTexte ?? null, // -> police_texte
        logoUrl,                    // -> logo_url
      }),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de l'enregistrement de l'identité visuelle");
      return;
    }

    // Les brouillons locaux ne servent plus une fois enregistrés en base.
    localStorage.removeItem(`identite:${entrepriseId}:palette`);
    localStorage.removeItem(`identite:${entrepriseId}:typographie`);

    router.push("/dashboard");
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

      {/* Grille principale : alignement en haut, pas d’étirement forcé */}
      <div className="grid grid-cols-1 items-start gap-xl xl:grid-cols-2">
        {/* ——— Colonne gauche : aperçu ——— */}
        <div className="flex min-w-0 flex-col gap-md">
          <h3 className="text-headline-sm font-headline-sm text-on-surface">
            Aperçu en direct
          </h3>

          <div className="relative flex h-[280px] flex-col overflow-hidden rounded-2xl border border-surface-variant bg-surface-container-lowest shadow-sm">
            <div className="flex h-9 shrink-0 items-center gap-2 border-b border-surface-variant bg-surface px-4">
              <span className="h-2.5 w-2.5 rounded-full bg-surface-variant" />
              <span className="h-2.5 w-2.5 rounded-full bg-surface-variant" />
              <span className="h-2.5 w-2.5 rounded-full bg-surface-variant" />
              <span className="ml-4 h-4 w-36 rounded-sm bg-surface-container" />
            </div>

            <div
              className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-5"
              style={{
                backgroundImage:
                  "radial-gradient(var(--outline, #777587) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            >
              <div className="absolute inset-0 bg-surface-container-lowest/80" />

              <div className="relative z-10 aspect-[1.75] w-full max-w-[240px] -rotate-2 transform overflow-hidden rounded-xl border border-outline-variant/60 bg-surface p-4 shadow-[0_12px_28px_rgba(27,27,35,0.14)] transition-transform duration-300 hover:rotate-0">
                <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-primary-container/10 blur-2xl" />
                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-center gap-3">
                    <LogoMark
                      previewUrl={logoPreviewUrl}
                      sizeClassName="h-11 w-11"
                      iconSize={22}
                    />
                    <div>
                      <div className="mb-1.5 h-3 w-20 rounded bg-surface-variant" />
                      <div className="h-2 w-14 rounded bg-surface-variant" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <div className="mb-1.5 h-2 w-16 rounded bg-surface-variant" />
                      <div className="h-1.5 w-24 rounded bg-surface-variant" />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-secondary">
                      Carte de visite
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ——— Colonne droite : actions ——— */}
        <div className="flex min-w-0 flex-col gap-md">
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
              className={`group flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-lg text-center transition-all ${
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
              <div className="mb-md flex h-14 w-14 items-center justify-center rounded-full bg-surface-container transition-colors group-hover:bg-primary-container group-hover:text-on-primary-container">
                <span className="material-symbols-outlined text-secondary text-[28px] group-hover:text-on-primary-container">
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
                placeholder="Ex: Un logo minimaliste pour un café,couleurs chaudes..."
                className="w-full resize-none rounded-lg border border-outline-variant bg-white p-md text-body-md font-body-md text-on-surface focus:border-primary focus:ring focus:ring-primary/20"
              />

              <div className="flex flex-wrap items-center justify-between gap-sm">
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

      {error && (
        <p className="font-body-sm text-body-sm text-red-600">{error}</p>
      )}

      {/* Barre d'action finale : envoie palette + typographie + logo en base */}
      <div className="sticky bottom-4 z-40 flex justify-end pt-2">
        <button
          type="button"
          onClick={handleFinish}
          disabled={saving}
          className="flex items-center gap-sm rounded-full bg-primary-container px-xl py-md text-label-md font-label-md font-bold text-on-primary shadow-[0_10px_15px_-3px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-1 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Enregistrement..." : "Terminer l'identité visuelle"}
          <span className="material-symbols-outlined text-[20px]">
            check_circle
          </span>
        </button>
      </div>
    </div>
  );
}

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
          className="h-full w-full object-cover"
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
