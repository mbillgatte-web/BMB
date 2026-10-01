import {
  Briefcase,
  Eye,
  FileText,
  Globe,
  Megaphone,
  PaintBrush,
  Sparkle,
  SquaresFour,
  Swatches,
  TextAa,
  type Icon,
} from "@phosphor-icons/react";

// Icônes Phosphor : la Sidebar les rend en « duotone » (inactif) ou « fill »
// (page en cours), voir ItemIcon dans Sidebar.tsx.
export type NavIcon = Icon;

export type NavChild = {
  icon: NavIcon;
  label: string;
  link: string;
};

export type NavItem = {
  icon: NavIcon;
  label: string;
  link?: string;
  children?: NavChild[];
};

export type NavGroup = {
  /** Titre de section affiché en majuscules dans la Sidebar ; absent = pas d'en-tête. */
  heading?: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { icon: SquaresFour, label: "Tableau de bord", link: "/dashboard" },
      { icon: Briefcase, label: "Projets", link: "/Projets" },
      { icon: FileText, label: "Démarches administratives" },
    ],
  },
  {
    heading: "Marque",
    items: [
      {
        icon: PaintBrush,
        label: "Identité visuelle",
        children: [
          { icon: Eye, label: "Vue d'ensemble", link: "/IdentiteVisuelle" },
          { icon: Swatches, label: "Palette de couleurs", link: "/PaletteColor" },
          { icon: TextAa, label: "Typographie", link: "/Typographie" },
          { icon: Sparkle, label: "Logo", link: "/Logo" },
        ],
      },
      { icon: Globe, label: "Mon site web", link: "/Templates" },
      { icon: Megaphone, label: "Visuels marketing", link: "/Visuels" },
    ],
  },
];

/**
 * Retrouve le libellé de nav correspondant à un pathname donné (item
 * simple ou sous-lien), pour le fil d'ariane de TopNav.tsx. `null` si le
 * pathname ne correspond à rien de connu (ex: page hors navigation).
 */
export function findNavLabel(pathname: string | null): string | null {
  if (!pathname) return null;

  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (item.link === pathname) return item.label;
      const child = item.children?.find((c) => c.link === pathname);
      if (child) return child.label;
    }
  }
  return null;
}
