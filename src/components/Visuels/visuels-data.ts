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

// Les formats restent décrits à la main (nom, dimensions, icône...) : ce
// sont des catégories, pas des images. `id` = nom du sous-dossier attendu
// dans public/visuels/ (voir src/lib/visuelsFs.ts).
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

/**
 * Une image de la galerie, dérivée automatiquement du contenu de
 * public/visuels/<formatId>/ (voir getVisuelsByCategory dans
 * src/lib/visuelsFs.ts) -- pas de nom/description saisis à la main.
 */
export interface VisualImage {
  /** Identifie l'image de façon stable (son chemin) : sert de `key` React. */
  id: string;
  formatId: string;
  src: string;
}

/**
 * Aplati `{ [formatId]: chemins[] }` (renvoyé par getVisuelsByCategory,
 * lui-même appelé côté serveur dans Visuels/page.tsx) en une liste plate
 * de VisualImage, dans l'ordre des catégories connues.
 */
export function buildVisualImages(
  imagesByCategory: Record<string, string[]>
): VisualImage[] {
  return VISUAL_FORMATS.flatMap((format) =>
    (imagesByCategory[format.id] ?? []).map((src) => ({
      id: src,
      formatId: format.id,
      src,
    }))
  );
}
