import {
  Image,
  FileImage,
  RectangleHorizontal,
  IdCard,
  type LucideIcon,
} from "lucide-react";

export interface VisualFormat {
  id: string;
  name: string;
  description: string;
  dimensions: string;
  /** ratio CSS (largeur / hauteur) utilisé pour les aperçus */
  aspectRatio: string;
  icon: LucideIcon;
}

export const VISUAL_FORMATS: VisualFormat[] = [
  {
    id: "post-social",
    name: "Post réseaux sociaux",
    description: "Format carré, idéal pour Instagram, Facebook ou LinkedIn.",
    dimensions: "1080 × 1080 px",
    aspectRatio: "1 / 1",
    icon: Image,
  },
  {
    id: "flyer",
    name: "Flyer",
    description: "Format A4 portrait, pour impression ou distribution.",
    dimensions: "210 × 297 mm",
    aspectRatio: "210 / 297",
    icon: FileImage,
  },
  {
    id: "banniere",
    name: "Bannière",
    description: "Format large, pour couverture de page ou bannière web.",
    dimensions: "1200 × 628 px",
    aspectRatio: "1200 / 628",
    icon: RectangleHorizontal,
  },
  {
    id: "carte-visite",
    name: "Carte de visite",
    description: "Format standard, pour impression professionnelle.",
    dimensions: "85 × 55 mm",
    aspectRatio: "85 / 55",
    icon: IdCard,
  },
];

export interface VisualTemplate {
  id: string;
  formatId: string;
  name: string;
  description: string;
  accentColor: string;
}

export const VISUAL_TEMPLATES: VisualTemplate[] = [
  // Post réseaux sociaux
  {
    id: "post-annonce",
    formatId: "post-social",
    name: "Annonce produit",
    description: "Met en avant un produit ou service avec un titre percutant.",
    accentColor: "4648D4",
  },
  {
    id: "post-citation",
    formatId: "post-social",
    name: "Citation de marque",
    description: "Une citation ou un message inspirant sur fond de marque.",
    accentColor: "C2410C",
  },
  {
    id: "post-promo",
    formatId: "post-social",
    name: "Promotion",
    description: "Structure pensée pour une offre ou une réduction limitée.",
    accentColor: "16A34A",
  },
  // Flyer
  {
    id: "flyer-evenement",
    formatId: "flyer",
    name: "Événement",
    description: "Annonce d'un événement avec date, lieu et appel à l'action.",
    accentColor: "7C3AED",
  },
  {
    id: "flyer-catalogue",
    formatId: "flyer",
    name: "Catalogue de services",
    description: "Présente plusieurs services ou produits sur une page.",
    accentColor: "0891B2",
  },
  // Bannière
  {
    id: "banniere-couverture",
    formatId: "banniere",
    name: "Couverture de page",
    description: "Bannière large pour l'en-tête d'une page ou d'un profil.",
    accentColor: "1D4ED8",
  },
  {
    id: "banniere-pub",
    formatId: "banniere",
    name: "Publicité web",
    description: "Format publicitaire avec message clair et bouton d'action.",
    accentColor: "B45309",
  },
  // Carte de visite
  {
    id: "carte-classique",
    formatId: "carte-visite",
    name: "Classique",
    description: "Logo, nom et coordonnées, mise en page sobre.",
    accentColor: "27272A",
  },
  {
    id: "carte-moderne",
    formatId: "carte-visite",
    name: "Moderne",
    description: "Mise en page asymétrique avec touche de couleur de marque.",
    accentColor: "0D9488",
  },
];
