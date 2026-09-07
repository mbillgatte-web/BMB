"use client";

import { Palette, Type, ImageIcon, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { useEntrepriseId } from "@/hooks/useEntrepriseId";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { FONT_FAMILY_VARS } from "./police";

/**
 * Récapitulatif en lecture seule de toute l'identité visuelle déjà
 * enregistrée pour l'entreprise courante (palette, typographie, logo), pour
 * ne pas avoir à naviguer entre /PaletteColor, /Typographie et /Logo juste
 * pour voir où on en est. Chaque section renvoie vers sa page dédiée pour
 * l'édition -- cette page ne modifie rien elle-même.
 */
export default function VueEnsemble() {
  const {
    entrepriseId,
    loading: loadingEntreprise,
    error: entrepriseError,
  } = useEntrepriseId();
  const {
    identiteVisuelle,
    loading: loadingIdentite,
    error: identiteError,
  } = useIdentiteVisuelle(entrepriseId);

  // Même convention que Sidebar.tsx : on précise l'entreprise dans l'URL
  // des liens "Modifier" quand on la connaît.
  const withEntreprise = (link: string) =>
    entrepriseId ? `${link}?entrepriseId=${entrepriseId}` : link;

  if (loadingEntreprise || loadingIdentite) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse rounded-xl border border-outline-variant bg-surface-container-lowest"
          />
        ))}
      </div>
    );
  }

  if (entrepriseError || identiteError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error/5 p-6 text-body-md text-error">
        {entrepriseError || identiteError}
      </div>
    );
  }

  if (!identiteVisuelle) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-12 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Vous n’avez pas encore configuré l’identité visuelle de cette
          entreprise.
        </p>
        <Button href={withEntreprise("/PaletteColor")}>
          Commencer par la palette
        </Button>
      </div>
    );
  }

  const {
    palette_mode,
    couleur_primaire,
    couleur_fond,
    couleur_accent,
    police_titre,
    police_texte,
    logo_url,
  } = identiteVisuelle;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Palette */}
      <section className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container/20 text-primary">
              <Palette className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <h2 className="font-label-md text-label-md text-on-surface">
              Palette de couleurs
            </h2>
          </div>
          {palette_mode && (
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
              {palette_mode === "3" ? "3 couleurs" : "2 couleurs"}
            </span>
          )}
        </header>

        <div className="flex flex-1 flex-col gap-3">
          {[
            { label: "Fond", value: couleur_fond },
            { label: "Primaire", value: couleur_primaire },
            { label: "Accent", value: couleur_accent },
          ]
            .filter((swatch) => swatch.value)
            .map((swatch) => (
              <div key={swatch.label} className="flex items-center gap-3">
                <span
                  className="h-8 w-8 shrink-0 rounded-full border border-outline-variant/60 shadow-sm"
                  style={{ backgroundColor: swatch.value! }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-on-surface">{swatch.label}</p>
                </div>
                <span className="font-mono text-[11px] uppercase text-on-surface-variant">
                  {swatch.value}
                </span>
              </div>
            ))}
        </div>

        <Button
          href={withEntreprise("/PaletteColor")}
          variant="ghost"
          size="sm"
          className="mt-4 self-start"
        >
          Modifier
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </section>

      {/* Typographie */}
      <section className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
        <header className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary-container/30 text-secondary">
            <Type className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h2 className="font-label-md text-label-md text-on-surface">
            Typographie
          </h2>
        </header>

        <div className="flex flex-1 flex-col gap-4">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wider text-on-surface-variant">
              Titres — {police_titre ?? "non défini"}
            </p>
            <p
              className="truncate text-2xl font-semibold text-on-surface"
              style={{
                fontFamily: police_titre
                  ? FONT_FAMILY_VARS[police_titre]
                  : undefined,
              }}
            >
              Aa Bb Cc
            </p>
          </div>

          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wider text-on-surface-variant">
              Texte — {police_texte ?? "non défini"}
            </p>
            <p
              className="text-sm text-on-surface-variant"
              style={{
                fontFamily: police_texte
                  ? FONT_FAMILY_VARS[police_texte]
                  : undefined,
              }}
            >
              Voici un aperçu du texte courant de votre marque.
            </p>
          </div>
        </div>

        <Button
          href={withEntreprise("/Typographie")}
          variant="ghost"
          size="sm"
          className="mt-4 self-start"
        >
          Modifier
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </section>

      {/* Logo */}
      <section className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-md shadow-sm">
        <header className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-tertiary-container/30 text-tertiary">
            <ImageIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </span>
          <h2 className="font-label-md text-label-md text-on-surface">Logo</h2>
        </header>

        <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-outline-variant/60 bg-surface p-6">
          {logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo_url}
              alt="Logo de l’entreprise"
              className="max-h-32 max-w-full object-contain"
            />
          ) : (
            <p className="text-center text-sm text-on-surface-variant">
              Aucun logo enregistré
            </p>
          )}
        </div>

        <Button
          href={withEntreprise("/Logo")}
          variant="ghost"
          size="sm"
          className="mt-4 self-start"
        >
          Modifier
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </section>
    </div>
  );
}
