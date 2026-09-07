import {
  LayoutDashboard,
  Folder,
  BrainCircuit,
  ListChecks,
  ClipboardList,
  FileText,
  ChartNoAxesCombined,
  LayoutTemplate,
  ImagePlus,
  type LucideIcon,
} from "lucide-react";

export type NavChild = {
  label: string;
  link: string;
};

export type NavItem = {
  icon: LucideIcon;
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
      { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
      { icon: Folder, label: "Projects" },
      { icon: BrainCircuit, label: "Etude de faisabilité" },
      { icon: ListChecks, label: "Business Plan" },
      { icon: ClipboardList, label: "Taches" },
      { icon: FileText, label: "Livrables" },
      { icon: ChartNoAxesCombined, label: "Demarche administrative" },
    ],
  },
  {
    heading: "Marque",
    items: [
      {
        icon: Folder,
        label: "Identité visuelle",
        children: [
          { label: "Vue d'ensemble", link: "/IdentiteVisuelle" },
          { label: "Palette de couleurs", link: "/PaletteColor" },
          { label: "Typographie", link: "/Typographie" },
          { label: "Logo", link: "/Logo" },
        ],
      },
      { icon: LayoutTemplate, label: "Mon site web", link: "/Templates" },
      { icon: ImagePlus, label: "Visuels marketing", link: "/Visuels" },
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
