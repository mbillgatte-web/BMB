"use client";

import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { FormError } from "@/components/ui/Field";
import { useEntrepriseId } from "@/hooks/useEntrepriseId";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { FONT_FAMILY_VARS } from "./police";

/**
 * Récapitulatif en lecture seule de toute l'identité visuelle déjà
 * enregistrée pour l'entreprise courante (palette, typographie, logo), pour
 * ne pas avoir à naviguer entre /PaletteColor, /Typographie et /Logo juste
 * pour voir où on en est. Chaque section renvoie vers sa page dédiée pour
 * l'édition -- cette page ne modifie rien elle-même. Une section encore
 * vide est mise en avant (bordure pointillée, bouton « Ajouter »), les
 * sections remplies restent en retrait.
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr_2fr]">
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
      <FormError>
        {/* L'erreur d'entreprise est déjà une phrase pour l'utilisateur ;
            celle de la base est technique, on la remplace. */}
        {entrepriseError ||
          "Impossible de charger l’identité visuelle. Réessayez."}
      </FormError>
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

  const paletteRemplie = Boolean(couleur_primaire && couleur_fond);
  const typoRemplie = Boolean(police_titre && police_texte);
  const logoRempli = Boolean(logo_url);

  return (
    <div className="stagger-in grid grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr_2fr]">
      {/* Palette */}
      <Section
        titre="Palette de couleurs"
        remplie={paletteRemplie}
        href={withEntreprise("/PaletteColor")}
        aside={
          palette_mode && (
            <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-medium text-on-surface-variant">
              {palette_mode === "3" ? "3 couleurs" : "2 couleurs"}
            </span>
          )
        }
      >
        {paletteRemplie ? (
          <div className="flex flex-col gap-3">
            <div className="flex h-16 overflow-hidden rounded-lg border border-outline-variant/60">
              {[couleur_primaire, couleur_fond, couleur_accent]
                .filter(Boolean)
                .map((c, i) => (
                  <span
                    key={i}
                    className="flex-1"
                    style={{ backgroundColor: c! }}
                    aria-hidden="true"
                  />
                ))}
            </div>
            {[
              { label: "Principale", value: couleur_primaire },
              { label: "Fond", value: couleur_fond },
              { label: "Accent", value: couleur_accent },
            ]
              .filter((swatch) => swatch.value)
              .map((swatch) => (
                <div
                  key={swatch.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-on-surface">{swatch.label}</span>
                  <span className="font-mono text-[11px] uppercase text-on-surface-variant">
                    {swatch.value}
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">
            Aucune palette choisie pour l’instant.
          </p>
        )}
      </Section>

      {/* Typographie */}
      <Section
        titre="Typographie"
        remplie={typoRemplie}
        href={withEntreprise("/Typographie")}
      >
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wider text-on-surface-variant">
              Titres : {police_titre ?? "à choisir"}
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
              Texte : {police_texte ?? "à choisir"}
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
      </Section>

      {/* Logo */}
      <Section
        titre="Logo"
        remplie={logoRempli}
        href={withEntreprise("/Logo")}
      >
        <div className="flex h-full min-h-[120px] items-center justify-center rounded-lg bg-surface-container-low p-6">
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
      </Section>
    </div>
  );
}

/**
 * Carte d'une section du récapitulatif. Remplie : bordure pleine et lien
 * discret « Modifier ». Vide : bordure pointillée et bouton « Ajouter »
 * mis en avant, pour que l'œil aille vers ce qu'il reste à faire.
 */
function Section({
  titre,
  remplie,
  href,
  aside,
  children,
}: {
  titre: string;
  remplie: boolean;
  href: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={`flex flex-col rounded-xl p-md ${
        remplie
          ? "border border-outline-variant bg-surface-container-lowest"
          : "border-2 border-dashed border-primary/50 bg-surface-container-lowest"
      }`}
    >
      <header className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-label-md text-label-md text-on-surface">{titre}</h2>
        {aside}
      </header>

      <div className="flex-1">{children}</div>

      {remplie ? (
        <Button href={href} variant="ghost" size="sm" className="mt-4 self-start">
          Modifier
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      ) : (
        <Button href={href} size="sm" className="mt-4 self-start">
          Ajouter
        </Button>
      )}
    </section>
  );
}
