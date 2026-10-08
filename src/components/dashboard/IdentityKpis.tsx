"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Copy,
  ExternalLink,
  Folder,
  Globe,
  ImageIcon,
  Palette,
  Type,
} from "lucide-react";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";
import { useProjetsActifs } from "@/hooks/useProjetsActifs";
import { useSitesEntreprise } from "@/hooks/useSitesEntreprise";
import { FONT_FAMILY_VARS } from "@/components/Identite_visuel/police";

// Cinq cartes sur une ligne à partir de `lg` : padding et visuels légèrement
// réduits par rapport à l'ancienne rangée de quatre pour que tout tienne.
const CARTE =
  "group relative flex min-h-[120px] flex-col justify-between overflow-hidden rounded-2xl border border-white/70 bg-white/90 p-3.5 shadow-[0_16px_30px_-22px_rgba(20,50,30,0.7)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_34px_-22px_rgba(20,50,30,0.55)]";
const GRILLE =
  "relative z-10 hidden w-full grid-cols-1 gap-sm md:grid md:grid-cols-3 lg:grid-cols-5";
const ICONE_ACTION =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary";

/** Icône « copier » qui devient une coche pendant 2 s. */
function BoutonCopier({ texte }: { texte: string }) {
  const [copie, setCopie] = useState(false);
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Presse-papiers refusé (http, permissions) : l'adresse reste
      // sélectionnable à la main, rien d'autre à faire ici.
    }
  };
  return (
    <button
      type="button"
      onClick={copier}
      title={copie ? "Adresse copiée" : "Copier l'adresse"}
      className={`${ICONE_ACTION} ${copie ? "text-primary" : ""}`}
    >
      {copie ? (
        <Check className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      <span className="sr-only">{copie ? "Adresse copiée" : "Copier l'adresse"}</span>
    </button>
  );
}

export default function IdentityKpis() {
  const { entreprise, loading: loadingEntreprise } = useEntreprise();
  const { identiteVisuelle, loading: loadingIdentite } = useIdentiteVisuelle(
    entreprise?.id ?? null
  );
  // « Projets actifs » = projets « idée » ou « en cours » de l'entreprise
  // sélectionnée (table projet), plus le nombre d'entreprises du compte.
  const { nombre: projetsActifs, loading: loadingProjets } = useProjetsActifs(
    entreprise?.id ?? null
  );
  // Sites de l'entreprise (table site, sans HTML) pour la carte « Site web »
  // et la pastille « Site » de la bande mobile.
  const { sites, loading: loadingSites } = useSitesEntreprise(entreprise?.id ?? null);
  const loading = loadingEntreprise || loadingIdentite || loadingProjets || loadingSites;
  const withEntreprise = (href: string) =>
    entreprise ? `${href}?entrepriseId=${entreprise.id}` : href;

  if (loading) {
    return (
      <>
        {/* Squelette mobile : même gabarit que la bande d'avancement
            ci-dessous (une ligne de pastilles), pas cinq grands blocs. */}
        <div className="flex gap-2 overflow-hidden max-md:-order-2 md:hidden" aria-hidden="true">
          {["logo", "type", "palette", "projets", "site"].map((item) => (
            <div
              key={item}
              className="h-11 w-36 shrink-0 animate-pulse rounded-lg border border-outline-variant/60 bg-surface/80"
            />
          ))}
        </div>
        <div className={GRILLE}>
          {["logo", "type", "palette", "projets", "site"].map((item) => (
            <div
              key={item}
              className="h-[120px] animate-pulse rounded-2xl border border-outline-variant/60 bg-surface/80"
            />
          ))}
        </div>
      </>
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

  // Site web : les sites publiés viennent en tête de la liste (voir
  // listSitesDeLEntreprise), le premier est celui mis en avant.
  const publies = sites.filter((s) => s.est_publie && s.slug);
  const sitePublie = publies[0];
  const siteEnLigne = Boolean(sitePublie);
  const siteEtat = siteEnLigne ? "en ligne" : sites.length > 0 ? "brouillon" : "aucun";
  // window n'existe qu'au client ; on est après le chargement, donc monté.
  const siteUrl =
    sitePublie && typeof window !== "undefined"
      ? `${window.location.origin}/s/${sitePublie.slug}`
      : null;
  const autresEnLigne = publies.length - 1;

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
          className="h-10 w-10 rounded-xl bg-white/90 object-contain p-1 shadow-sm"
        />
      ) : (
        <ImageIcon className="h-6 w-6" aria-hidden="true" />
      ),
    },
    {
      label: "Typographie",
      detail: identiteVisuelle?.police_titre ?? "À choisir",
      href: withEntreprise("/Typographie"),
      icon: Type,
      ready: typeReady,
      content: (
        <span
          className="text-[1.85rem] font-bold leading-none text-on-surface"
          style={{
            fontFamily: identiteVisuelle?.police_titre
              ? FONT_FAMILY_VARS[identiteVisuelle.police_titre]
              : undefined,
          }}
        >
          Aa
        </span>
      ),
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
                className="h-8 w-8 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
                aria-label={`Couleur ${index + 1}: ${color}`}
              />
            )
          )}
        </div>
      ),
    },
    {
      label: "Projets actifs",
      detail: `${projetsActifs} projet${projetsActifs > 1 ? "s" : ""}`,
      href: "/Projets",
      icon: Folder,
      ready: true,
      content: (
        <span className="font-mono-stats text-[1.85rem] font-bold leading-none text-on-surface">
          {projetsActifs}
        </span>
      ),
    },
  ] as const;

  // Libellés courts de la bande mobile (« Logo · à définir ») : on ne
  // réutilise pas `detail` tel quel, trop long pour une pastille.
  const stripItems = [
    { label: "Logo", state: logoReady ? "prêt" : "à définir", href: cards[0].href, ready: logoReady },
    { label: "Police", state: typeReady ? "choisie" : "à choisir", href: cards[1].href, ready: typeReady },
    { label: "Palette", state: paletteReady ? `${palette.length} couleurs` : "à définir", href: cards[2].href, ready: paletteReady },
    { label: "Projets", state: String(projetsActifs), href: cards[3].href, ready: projetsActifs > 0 },
    { label: "Site", state: siteEtat, href: "/Templates", ready: siteEnLigne },
  ];

  // En-tête commun aux cinq cartes : icône de catégorie, même fond neutre
  // partout (pas de couleur par carte). Pas de flèche : la carte est un lien.
  const enTete = (Icon: typeof Globe) => (
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-container text-on-surface">
        <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
      </span>
    </div>
  );

  // Carte « Site web » : contient elle-même des liens et un bouton quand le
  // site est en ligne, donc c'est un <div> (pas un <Link> englobant comme
  // les quatre autres) ; sinon toute la carte renvoie vers /Templates.
  const corpsSite = (
    <>
      <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">Site web</p>
      <p
        className={`mt-0.5 text-[15px] font-bold leading-5 ${
          siteEnLigne ? "text-primary" : "text-on-surface"
        }`}
      >
        {siteEnLigne ? "En ligne" : siteEtat === "brouillon" ? "Brouillon" : "Aucun"}
      </p>
    </>
  );
  const carteSite =
    siteEnLigne && siteUrl ? (
      <div key="site" className={CARTE}>
        {enTete(Globe)}
        <div className="min-w-0">
          {corpsSite}
          <div className="mt-0.5 flex min-w-0 items-center gap-0.5">
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={siteUrl}
              className="min-w-0 flex-1 truncate font-body-sm text-body-sm text-on-surface hover:text-primary"
            >
              /s/{sitePublie.slug}
            </a>
            <BoutonCopier texte={siteUrl} />
            <a
              href={siteUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Ouvrir le site"
              className={ICONE_ACTION}
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="sr-only">Ouvrir le site</span>
            </a>
            {autresEnLigne > 0 && (
              <Link
                href="/Templates"
                className="shrink-0 text-[11px] font-semibold text-on-surface-variant hover:text-primary"
              >
                +{autresEnLigne} en ligne
              </Link>
            )}
          </div>
        </div>
      </div>
    ) : (
      <Link key="site" href="/Templates" className={CARTE}>
        {enTete(Globe)}
        <div className="min-w-0">
          {corpsSite}
          <p className="mt-0.5 truncate font-body-sm text-body-sm font-semibold text-primary underline-offset-2 group-hover:underline">
            {siteEtat === "brouillon" ? "Publier" : "Créer mon site"}
          </p>
        </div>
      </Link>
    );

  return (
    <>
      {/* Sous `md` : bande d'avancement sur une ligne, défilable, qui
          remplace les cinq tuiles. Mêmes liens, 44 px de haut, texte 14 px,
          pas de gros chiffres. Le dernier élément dépasse volontairement du
          bord : c'est ce qui indique qu'on peut faire défiler. */}
      <nav
        aria-label="Avancement de votre identité"
        className="stagger-in -mx-md flex gap-2 overflow-x-auto px-md pb-1 [scrollbar-width:none] max-md:-order-2 md:hidden"
      >
        {stripItems.map(({ label, state, href, ready }) => (
          <Link
            key={label}
            href={href}
            className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg border border-outline-variant bg-surface px-3 text-sm text-on-surface transition-colors active:bg-surface-container-low"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${ready ? "bg-primary" : "border border-outline bg-transparent"}`}
              aria-hidden="true"
            />
            <span className="font-semibold">{label}</span>
            <span className="text-on-surface-variant" aria-hidden="true">·</span>
            <span className={ready ? "font-medium text-primary" : "text-on-surface-variant"}>
              {state}
            </span>
          </Link>
        ))}
      </nav>

      <div className={GRILLE}>
      {cards.map(({ label, detail, href, icon: Icon, ready, content }) => (
        <Link key={label} href={href} className={CARTE}>
          {enTete(Icon)}
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="font-label-sm text-label-sm uppercase text-on-surface-variant">{label}</p>
              <p className={`mt-1 truncate font-body-sm text-body-sm ${ready ? "text-on-surface" : "text-on-surface-variant"}`}>
                {detail}
              </p>
            </div>
            <div className="flex h-10 shrink-0 items-center justify-center">{content}</div>
          </div>
        </Link>
      ))}
      {carteSite}
      </div>
    </>
  );
}
