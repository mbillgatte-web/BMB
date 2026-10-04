"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { MessageSquareText, Upload } from "lucide-react";
import { supabase } from "@/lib/supabase/browser";
import { useEntrepriseId } from "@/hooks/useEntrepriseId";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { uploaderLogo } from "@/data/identiteVisuelle";
import { libelleSecteur } from "@/data/entreprise";
import ChatComposer from "@/components/Templates/ChatComposer";
import SoonBadge from "@/components/ui/SoonBadge";
import Button from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";

interface LogoBuilderProps {
  /** Appelé quand un fichier logo valide est importé (glisser-déposer ou sélecteur) */
  onLogoUploaded?: (file: File) => void;
  /** Appelé quand l'utilisateur clique sur « Générer » */
  onGenerateWithAI?: (prompt: string, selectedStyles: string[]) => void;
}

// Contrôle côté client uniquement : formats d'image sûrs et taille
// raisonnable pour un logo. Le contrôle côté serveur reste à part.
const TYPES_ACCEPTES = ["image/png", "image/jpeg", "image/webp"];
const TAILLE_MAX = 5 * 1024 * 1024;

/** Couleur principale du thème, utilisée quand aucune palette n'est connue. */
const PRIMAIRE_THEME = "#0F7A38";

/** Luminance relative (WCAG) d'une couleur #rrggbb, entre 0 et 1. */
function luminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  if (Number.isNaN(n)) return 0;
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

const sansAbonnement = () => () => {};

export default function LogoBuilder({
  onLogoUploaded,
  onGenerateWithAI,
}: LogoBuilderProps) {
  const router = useRouter();
  // Id transmis depuis /PaletteColor -> /Typographie -> ici (ou détecté
  // automatiquement si le compte n'a qu'une seule entreprise, voir
  // src/hooks/useEntrepriseId.ts). C'est la dernière étape : on en a
  // besoin pour savoir sur quelle entreprise rattacher l'identité
  // visuelle, et pour relire palette/typographie que les deux pages
  // précédentes ont laissées dans localStorage.
  const {
    entrepriseId,
    loading: loadingEntreprise,
    error: entrepriseIdError,
  } = useEntrepriseId();

  // Nom de l'entreprise pour l'aperçu (repli texte quand il n'y a pas de logo).
  const { entreprise: entrepriseSelectionnee, entreprises } = useEntreprise();
  const entreprise =
    entreprises.find((e) => e.id === entrepriseId) ?? entrepriseSelectionnee;

  const { identiteVisuelle } = useIdentiteVisuelle(entrepriseId);

  // Palette choisie à l'étape précédente (brouillon localStorage), lue sans
  // effet ni setState : useSyncExternalStore renvoie null côté serveur.
  const cle = entrepriseId ? `identite:${entrepriseId}:palette` : null;
  const paletteBrouillonRaw = useSyncExternalStore(
    sansAbonnement,
    () => (cle ? localStorage.getItem(cle) : null),
    () => null
  );
  const couleurPrimaire = useMemo(() => {
    if (paletteBrouillonRaw) {
      try {
        const p = JSON.parse(paletteBrouillonRaw) as { primary?: string };
        if (p.primary) return p.primary;
      } catch {
        // brouillon illisible : on retombe sur ce qui est en base
      }
    }
    return identiteVisuelle?.couleur_primaire ?? PRIMAIRE_THEME;
  }, [paletteBrouillonRaw, identiteVisuelle]);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fichierErreur, setFichierErreur] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<string[]>([
    "Minimaliste",
    "Géométrique",
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL blob du fichier local : dérivée du fichier (pas de setState dans
  // un effet), l'effet ne sert qu'à libérer la ressource.
  const logoPreviewUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile]
  );
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) URL.revokeObjectURL(logoPreviewUrl);
    };
  }, [logoPreviewUrl]);

  // Priorité au fichier tout juste choisi localement ; sinon, le logo déjà
  // enregistré pour cette entreprise (voir useIdentiteVisuelle.ts).
  const displayedLogoUrl = logoPreviewUrl ?? identiteVisuelle?.logo_url ?? null;

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!TYPES_ACCEPTES.includes(file.type)) {
        setFichierErreur(
          "Format non pris en charge. Choisissez un fichier PNG, JPG ou WebP."
        );
        return;
      }
      if (file.size > TAILLE_MAX) {
        setFichierErreur(
          `Fichier trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo). La limite est de 5 Mo.`
        );
        return;
      }
      setFichierErreur("");
      setLogoFile(file);
      onLogoUploaded?.(file);
    },
    [onLogoUploaded]
  );

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
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
      setError("Entreprise introuvable. Recommencez depuis la création d'entreprise.");
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

    // Par défaut, on garde le logo déjà enregistré (si l'utilisateur n'a
    // pas choisi de nouveau fichier cette fois) -- écrasé plus bas
    // seulement si `logoFile` est renseigné.
    let logoUrl: string | null = identiteVisuelle?.logo_url ?? null;

    if (logoFile) {
      try {
        logoUrl = await uploaderLogo(supabase, entrepriseId, logoFile);
      } catch (err) {
        setSaving(false);
        setError(`Échec de l'envoi du logo : ${(err as Error).message}`);
        return;
      }
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
      // Ordre de priorité pour chaque champ : ce qui vient d'être choisi
      // cette session (localStorage) -> sinon ce qui existait déjà en base
      // pour cette entreprise (identiteVisuelle) -> sinon null. Sans le
      // 2e maillon, revisiter uniquement /Logo sans repasser par Palette/
      // Typographie effacerait leurs valeurs déjà enregistrées.
      body: JSON.stringify({
        entrepriseId,               // -> colonne entreprise_id (clé étrangère)
        paletteMode: palette?.mode ?? identiteVisuelle?.palette_mode ?? null,
        couleurPrimaire:
          palette?.primary ?? identiteVisuelle?.couleur_primaire ?? null,
        couleurFond:
          palette?.background ?? identiteVisuelle?.couleur_fond ?? null,
        couleurAccent:
          palette?.accent ?? identiteVisuelle?.couleur_accent ?? null,
        policeTitre:
          typographie?.policeTitre ?? identiteVisuelle?.police_titre ?? null,
        policeTexte:
          typographie?.policeTexte ?? identiteVisuelle?.police_texte ?? null,
        logoUrl,                    // -> logo_url (voir plus haut)
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

  const nomEntreprise = entreprise?.nom || "Nom de votre entreprise";
  const secteur = libelleSecteur(entreprise?.secteur_activite ?? null);
  const texteSurPrimaire =
    luminance(couleurPrimaire) > 0.4 ? "#191c1d" : "#ffffff";

  return (
    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-2">
      {/* Colonne gauche : aperçu */}
      <div className="flex min-w-0 flex-col gap-md xl:sticky xl:top-6">
        <h2 className="text-headline-sm font-headline-sm text-on-surface">
          Aperçu
        </h2>

        <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
          <ApercuLogo
            libelle="Sur votre couleur principale"
            fond={couleurPrimaire}
            couleurTexte={texteSurPrimaire}
            logoUrl={displayedLogoUrl}
            nom={nomEntreprise}
          />
          <ApercuLogo
            libelle="Sur fond blanc"
            fond="#ffffff"
            couleurTexte={couleurPrimaire}
            logoUrl={displayedLogoUrl}
            nom={nomEntreprise}
            bordure
          />
        </div>

        {(entreprise?.slogan || secteur) && (
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            {[nomEntreprise, entreprise?.slogan, secteur]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>

      {/* Colonne droite : actions */}
      <div className="flex min-w-0 flex-col gap-md">
        {/* Carte 1 : import */}
        <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="flex items-center gap-sm">
            <Upload
              className="h-5 w-5 text-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Importer
            </h3>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            PNG, JPG ou WebP, 5 Mo maximum. De préférence avec un fond
            transparent et au moins 512 × 512 px.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              // Permet de resélectionner le même fichier après une erreur.
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            aria-describedby={fichierErreur ? "logo-fichier-erreur" : undefined}
            className={`flex min-h-[160px] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-lg text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              isDraggingOver
                ? "border-primary bg-surface-container-low"
                : "border-outline-variant bg-surface hover:border-primary hover:bg-surface-container-low"
            }`}
          >
            <Upload
              className="h-7 w-7 text-on-surface-variant"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            {logoFile ? (
              <span className="max-w-full truncate text-label-md font-label-md text-on-surface">
                {logoFile.name}
              </span>
            ) : (
              <span className="text-label-md font-label-md text-on-surface">
                Glissez votre logo ici ou cliquez pour choisir un fichier
              </span>
            )}
            <span className="text-body-sm font-body-sm text-on-surface-variant">
              {logoFile ? "Cliquez pour en choisir un autre" : "PNG, JPG ou WebP"}
            </span>
          </button>

          {fichierErreur && (
            <p
              id="logo-fichier-erreur"
              role="alert"
              className="text-body-sm font-body-sm text-error"
            >
              {fichierErreur}
            </p>
          )}
        </div>

        {/* Carte 2 : génération IA */}
        <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="flex items-center gap-sm">
            <MessageSquareText
              className="h-5 w-5 text-primary"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <h3 className="text-headline-sm font-headline-sm text-on-surface">
              Générer avec l&apos;IA
            </h3>
            {!onGenerateWithAI && <SoonBadge />}
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Décrivez votre activité, les éléments clés et le style souhaité
            (minimaliste, vintage, typographique…).
          </p>
          {/* Même composeur que le générateur de site (ChatComposer).
              Tant que onGenerateWithAI n'est pas branché, la zone reste
              visible mais désactivée (badge « Bientôt » dans le titre). */}
          <ChatComposer
            value={aiPrompt}
            onChange={setAiPrompt}
            onSubmit={handleAIGenerate}
            disabled={!onGenerateWithAI}
            placeholder="Décrivez votre logo…"
            exemples={[
              "Un logo minimaliste pour un café, couleurs chaudes…",
              "Un monogramme élégant pour un cabinet d'avocats…",
              "Un logo typographique pour une école de code…",
            ]}
          />
        </div>

        {(error || entrepriseIdError) && (
          <FormError>{error || entrepriseIdError}</FormError>
        )}

        {/* Action finale : envoie palette + typographie + logo en base. */}
        <div className="flex justify-end">
          <Button
            onClick={handleFinish}
            loading={saving || loadingEntreprise}
            disabled={!entrepriseId}
          >
            {saving ? "Enregistrement…" : "Enregistrer l'identité visuelle"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Tuile d'aperçu : le logo (ou le nom en texte) sur un fond donné. */
function ApercuLogo({
  libelle,
  fond,
  couleurTexte,
  logoUrl,
  nom,
  bordure = false,
}: {
  libelle: string;
  fond: string;
  couleurTexte: string;
  logoUrl: string | null;
  nom: string;
  bordure?: boolean;
}) {
  return (
    <figure className="flex min-w-0 flex-col gap-2">
      <div
        className={`flex h-44 items-center justify-center overflow-hidden rounded-xl p-6 transition-colors duration-500 ${
          bordure ? "border border-outline-variant" : ""
        }`}
        style={{ backgroundColor: fond }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <span
            className="line-clamp-2 text-center text-xl font-bold leading-tight"
            style={{ color: couleurTexte }}
          >
            {nom}
          </span>
        )}
      </div>
      <figcaption className="text-label-sm font-label-sm text-on-surface-variant">
        {libelle}
      </figcaption>
    </figure>
  );
}
