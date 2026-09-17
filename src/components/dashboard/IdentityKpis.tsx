"use client";

import Link from "next/link";
import { ArrowUpRight, Folder, ImageIcon, Palette, Type } from "lucide-react";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { FONT_FAMILY_VARS } from "@/components/Identite_visuel/police";

export default function IdentityKpis() {
  const { entreprise, entreprises, loading: loadingEntreprise } = useEntreprise();
  const { identiteVisuelle, loading: loadingIdentite } = useIdentiteVisuelle(
    entreprise?.id ?? null
  );
  const loading = loadingEntreprise || loadingIdentite;
  const withEntreprise = (href: string) =>
    entreprise ? `${href}?entrepriseId=${entreprise.id}` : href;

  if (loading) {
    return (
      <div className="relative z-10 grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
        {["logo", "type", "palette", "projets"].map((item) => (
          <div
            key={item}
            className="h-[132px] animate-pulse rounded-2xl border border-outline-variant/60 bg-surface/80"
          />
        ))}
      </div>
    );
  }

  const logoReady = Boolean(identiteVisuelle?.logo_url);
  const typeReady = Boolean(identiteVisuelle?.police_titre);
  const palette = [
    identiteVisuelle?.couleur_fond,
    identiteVisuelle?.couleur_primaire,
    identiteVisuelle?.couleur_accent,
  ].filter((color): color is string => Boolean(color));
  const paletteReady = palette.length > 0;

  const cards = [
    {
      label: "Logo",
      detail: logoReady ? "Identité finalisée" : "À définir",
      href: withEntreprise("/Logo"),
      icon: ImageIcon,
      ready: logoReady,
      content: logoReady ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={identiteVisuelle?.logo_url ?? ""}
          alt={`Logo de ${entreprise?.nom ?? "votre entreprise"}`}
          className="h-12 w-12 rounded-xl bg-white/90 object-contain p-1.5 shadow-sm"
        />
      ) : (
        <ImageIcon className="h-6 w-6" aria-hidden="true" />
      ),
      iconClass: "bg-tertiary-container/20 text-tertiary",
    },
    {
      label: "Typographie",
      detail: identiteVisuelle?.police_titre ?? "À choisir",
      href: withEntreprise("/Typographie"),
      icon: Type,
      ready: typeReady,
      content: (
        <span
          className="text-[2.15rem] font-bold leading-none text-on-surface"
          style={{
            fontFamily: identiteVisuelle?.police_titre
              ? FONT_FAMILY_VARS[identiteVisuelle.police_titre]
              : undefined,
          }}
        >
          Aa
        </span>
      ),
      iconClass: "bg-secondary-container/30 text-secondary",
    },
    {
      label: "Palette",
      detail: paletteReady ? `${palette.length} couleurs actives` : "À définir",
      href: withEntreprise("/PaletteColor"),
      icon: Palette,
      ready: paletteReady,
      content: (
        <div className="flex -space-x-2">
          {(palette.length ? palette : ["#e4e1ed", "#c7c4d7", "#767586"]).map(
            (color, index) => (
              <span
                key={`${color}-${index}`}
                className="h-9 w-9 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
                aria-label={`Couleur ${index + 1}: ${color}`}
              />
            )
          )}
        </div>
      ),
      iconClass: "bg-primary-container/20 text-primary",
    },
    {
      label: "Projets actifs",
      detail: `${entreprises.length} projet${entreprises.length > 1 ? "s" : ""}`,
      href: "/dashboard",
      icon: Folder,
      ready: true,
      content: (
        <span className="font-mono-stats text-[2.15rem] font-bold leading-none text-on-surface">
          {entreprises.length}
        </span>
      ),
      iconClass: "bg-secondary-container/30 text-secondary",
    },
  ] as const;

  return (
    <div className="relative z-10 grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, detail, href, icon: Icon, ready, content, iconClass }) => (
        <Link
          key={label}
          href={href}
          className="group relative flex min-h-[132px] flex-col justify-between overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-md shadow-[0_16px_30px_-22px_rgba(35,37,120,0.7)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_34px_-22px_rgba(35,37,120,0.55)]"
        >
          <div className="flex items-start justify-between gap-3">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}>
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full text-outline transition-colors group-hover:bg-primary/10 group-hover:text-primary">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">{label}</p>
              <p className={`mt-1 truncate font-body-sm text-body-sm ${ready ? "text-on-surface" : "text-on-surface-variant"}`}>
                {detail}
              </p>
            </div>
            <div className="flex h-12 shrink-0 items-center justify-center">{content}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}