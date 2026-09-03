export interface SiteTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  /** Couleur hex utilisée pour générer la vignette placeholder (placehold.co) */
  accentColor: string;
}

export const CATEGORIES = [
  "Tous",
  "Restaurant",
  "Portfolio",
  "E-commerce",
  "Corporate",
  "Santé",
] as const;

export const TEMPLATES: SiteTemplate[] = [
  {
    id: "resto-moderne",
    name: "Resto Moderne",
    category: "Restaurant",
    description:
      "Une page d'accueil chaleureuse avec mise en avant du menu, galerie photo et réservation en ligne.",
    accentColor: "C2410C",
  },
  {
    id: "bistro-elegant",
    name: "Bistro Élégant",
    category: "Restaurant",
    description:
      "Design sobre et raffiné pour une adresse gastronomique, avec section avis clients.",
    accentColor: "78350F",
  },
  {
    id: "portfolio-minimal",
    name: "Portfolio Minimal",
    category: "Portfolio",
    description:
      "Grille de projets épurée pensée pour les créatifs indépendants et freelances.",
    accentColor: "27272A",
  },
  {
    id: "portfolio-creatif",
    name: "Portfolio Créatif",
    category: "Portfolio",
    description:
      "Mise en page dynamique avec grandes images et transitions, pour un profil artistique.",
    accentColor: "7C3AED",
  },
  {
    id: "boutique-essentiel",
    name: "Boutique Essentiel",
    category: "E-commerce",
    description:
      "Catalogue produit clair, panier visible et fiches produit détaillées.",
    accentColor: "16A34A",
  },
  {
    id: "shop-premium",
    name: "Shop Premium",
    category: "E-commerce",
    description:
      "Mise en avant des nouveautés et promotions, adaptée à une marque haut de gamme.",
    accentColor: "B45309",
  },
  {
    id: "corporate-classique",
    name: "Corporate Classique",
    category: "Corporate",
    description:
      "Structure institutionnelle : présentation, services, équipe et contact.",
    accentColor: "1D4ED8",
  },
  {
    id: "corporate-startup",
    name: "Corporate Startup",
    category: "Corporate",
    description:
      "Ton plus moderne avec sections produit, tarifs et témoignages clients.",
    accentColor: "0891B2",
  },
  {
    id: "sante-clinique",
    name: "Clinique Sereine",
    category: "Santé",
    description:
      "Présentation rassurante d'un cabinet ou d'une clinique, avec prise de rendez-vous.",
    accentColor: "0D9488",
  },
];
