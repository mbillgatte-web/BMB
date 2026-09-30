// Prompts envoyés à l'IA pour créer et modifier le site d'une entreprise par
// conversation (voir /api/generate-site). Tout ce qui est connu de
// l'entreprise est injecté AVANT la demande de l'utilisateur, avec une
// direction artistique précise, pour un résultat propre qui ne ressemble pas
// à une page générée "par défaut".
import { libelleSecteur, type Entreprise } from "@/data/entreprise";
import type { IdentiteVisuelle } from "@/data/identiteVisuelle";

// Ambiance et sections attendues selon le secteur (valeurs de SECTEURS).
const PAR_SECTEUR: Record<string, { ambiance: string; sections: string }> = {
  commerce: {
    ambiance: "commerçante, fiable et accueillante : on doit avoir envie de venir ou de commander.",
    sections: "produits ou rayons phares, points forts de la boutique (conseil, prix, livraison si pertinent), horaires, accès et contact",
  },
  technologie: {
    ambiance: "précise, claire et sérieuse : peu d'effets, beaucoup de lisibilité, une impression de maîtrise.",
    sections: "services proposés, manière de travailler (étapes), pour qui, contact",
  },
  education: {
    ambiance: "rassurante, structurée et chaleureuse, pensée pour les parents comme pour les apprenants.",
    sections: "formations ou programmes, pédagogie, public concerné, modalités d'inscription, contact",
  },
  Restaurant: {
    ambiance: "gourmande et chaleureuse : on doit presque sentir la cuisine.",
    sections: "présentation de la maison, carte (catégories de plats), horaires d'ouverture, réservation ou commande, accès et contact",
  },
  "Beauté": {
    ambiance: "élégante, douce et soignée, avec beaucoup d'espace et des détails raffinés.",
    sections: "prestations (soins, coiffure, etc.), l'expérience au salon, prise de rendez-vous, horaires, contact",
  },
  autre: {
    ambiance: "professionnelle et chaleureuse, fidèle à l'activité décrite.",
    sections: "présentation, services, pourquoi nous choisir (sans chiffres inventés), contact",
  },
};

/** Tout ce que la plateforme sait de l'entreprise, formaté pour l'IA. */
export function contexteEntreprise(entreprise: Entreprise, identite: IdentiteVisuelle | null): string {
  const secteur = entreprise.secteur_activite ? PAR_SECTEUR[entreprise.secteur_activite] ?? PAR_SECTEUR.autre : PAR_SECTEUR.autre;
  const chiffresTel = entreprise.contact?.replace(/[^\d]/g, "") ?? "";

  const lignes = [
    "=== L'ENTREPRISE ===",
    `Nom : ${entreprise.nom}`,
    `Secteur : ${entreprise.secteur_activite ? libelleSecteur(entreprise.secteur_activite) : "non précisé"}`,
    `Slogan : ${entreprise.slogan || "aucun (n'en invente pas, utilise une accroche simple et factuelle)"}`,
    `Téléphone : ${entreprise.contact || "non renseigné (n'affiche aucun numéro)"}`,
    chiffresTel
      ? `Lien WhatsApp à utiliser : https://wa.me/${chiffresTel}`
      : "WhatsApp : aucun numéro, n'affiche pas de bouton WhatsApp.",
    `Adresse : ${entreprise.adresse || "non renseignée (n'affiche aucune adresse)"}`,
    `Ambiance attendue pour ce secteur : ${secteur.ambiance}`,
    `Sections habituelles pour ce secteur (à adapter à la demande) : ${secteur.sections}.`,
    "Services : l'entreprise ne les a pas encore détaillés. Si la demande n'en précise pas, propose 3 ou 4 services réalistes et typiques du secteur, formulés sobrement, que l'utilisateur pourra corriger.",
    "",
    "=== IDENTITÉ VISUELLE (à respecter strictement) ===",
  ];

  if (identite) {
    lignes.push(
      `Couleur principale : ${identite.couleur_primaire ?? "non définie"} → boutons, liens, éléments actifs, titres forts.`,
      `Couleur d'accent : ${identite.couleur_accent ?? "non définie"} → petites touches (soulignements, pastilles, icônes), jamais en grands aplats.`,
      `Couleur de fond : ${identite.couleur_fond ?? "non définie"} → fond de page ou de sections alternées.`,
      `Police des titres : ${identite.police_titre ?? "non définie"} (à charger depuis Google Fonts).`,
      `Police du texte : ${identite.police_texte ?? "non définie"} (à charger depuis Google Fonts).`,
      identite.logo_url
        ? `Logo : ${identite.logo_url} → à placer dans l'en-tête (hauteur 36 à 48 px) et en pied de page, sans le déformer.`
        : "Logo : aucun. Écris le nom de l'entreprise dans la police des titres à la place."
    );
  } else {
    lignes.push(
      "Aucune identité visuelle définie : choisis une palette sobre (une couleur principale adaptée au secteur, un fond clair, une couleur de texte très foncée) et une paire de polices Google Fonts lisible."
    );
  }
  lignes.push("Les couleurs non définies se déduisent de celles qui le sont (nuances plus claires ou plus foncées).");

  return lignes.join("\n");
}

const DIRECTION_ARTISTIQUE = `=== DIRECTION ARTISTIQUE ===
Le site doit avoir l'air conçu par un bon studio de design local, pour CETTE entreprise précise, pas généré automatiquement.
- Mise en page éditoriale : alterne les compositions d'une section à l'autre (texte + visuel côte à côte, pleine largeur, grille asymétrique). Jamais trois sections qui se ressemblent à la suite.
- Typographie forte : titres grands et assurés (clamp() pour s'adapter à l'écran), texte courant à 16-18 px avec une hauteur de ligne de 1,6, largeur de lecture limitée à environ 65 caractères.
- Beaucoup d'espace : rythme vertical régulier (multiples de 8 px), sections bien séparées, rien de tassé.
- Couleurs : la couleur principale est utilisée avec retenue, sur ce qui compte (appels à l'action, liens, détails). Fonds clairs ou très foncés, contrastes texte/fond d'au moins 4,5:1.
- Visuels : sans photo disponible, crée de l'intérêt avec des formes géométriques simples en CSS, des blocs de couleur, des motifs discrets ou de grandes lettres typographiques, aux couleurs de la marque.
- Appels à l'action clairs et concrets (« Réserver une table », « Écrire sur WhatsApp », « Passer au salon »), pas « En savoir plus » partout.
- Textes : phrases courtes, concrètes, au vouvoiement, qui parlent de l'activité réelle. Le hero dit en une phrase ce que fait l'entreprise et pour qui.`;

const A_EVITER = `=== À ÉVITER ABSOLUMENT (effets typiques des sites générés par IA) ===
- Dégradés violet/bleu/rose, texte en dégradé, halos lumineux, taches floues en arrière-plan, effet « verre dépoli ».
- Trois cartes identiques avec une icône dans un cercle ; grilles de fonctionnalités génériques.
- Emojis utilisés comme icônes ; icônes décoratives sans rôle.
- Formules creuses : « Bienvenue sur notre site », « Découvrez », « Solutions innovantes », « Nous sommes passionnés », « Votre satisfaction est notre priorité », « Lorem ipsum ».
- Chiffres, statistiques, avis clients, noms de clients, prix, certifications ou années d'expérience INVENTÉS. N'affiche que des informations fournies.
- Ombres portées partout, coins très arrondis sur tout, tout centré, animations qui clignotent ou rebondissent.
- URL d'images inventées (Unsplash, placeholder, etc.).`;

const REGLES_TECHNIQUES = `=== RÈGLES TECHNIQUES ===
- Une seule page HTML autonome : <!DOCTYPE html>, <html lang="fr">, <meta charset>, <meta viewport>, <title> et <meta name="description"> pertinents.
- Tout le CSS dans une balise <style> dans le <head>. Aucun framework CSS. Les couleurs et polices déclarées en variables CSS dans :root (--couleur-principale, --couleur-accent, --couleur-fond, --couleur-texte, --police-titres, --police-texte) puis réutilisées partout.
- Responsive « mobile d'abord » : lisible dès 360 px de large, menu adapté sur mobile, conteneur centré de 1200 px maximum.
- HTML sémantique (header, nav, main, section avec id pour les ancres, footer), un seul h1, attributs alt, liens d'ancre dans la navigation.
- États :hover et :focus-visible sur tous les liens et boutons ; respecte prefers-reduced-motion.
- Animations facultatives et discrètes (apparition douce au défilement via IntersectionObserver), dans une seule balise <script> en fin de body.
- Images : seulement le logo et les images fournies par l'utilisateur, avec leurs URL exactes.
- Code concis : pas de commentaires, pas de CSS inutilisé.`;

/** Prompt de création d'un site complet. */
export function promptCreation(contexte: string, demande: string, imageJointe: string | null): string {
  return [
    "Tu es directeur artistique et développeur front-end senior. Tu crées le site web vitrine d'une petite entreprise.",
    "",
    contexte,
    "",
    DIRECTION_ARTISTIQUE,
    "",
    A_EVITER,
    "",
    REGLES_TECHNIQUES,
    "",
    "=== DEMANDE DE L'UTILISATEUR (prioritaire sur les choix de structure ci-dessus, jamais sur les interdits) ===",
    demande,
    imageJointe ? `Image fournie par l'utilisateur, à intégrer là où la demande l'indique : ${imageJointe}` : "",
    "",
    "=== FORMAT DE RÉPONSE ===",
    "Première ligne : « RÉSUMÉ : » suivi d'une phrase qui dit ce que tu as construit. Puis le code HTML complet, de <!DOCTYPE html> à </html>. Rien d'autre, pas de balises ```.",
  ].join("\n");
}

/** Réponse attendue pour une modification (JSON). */
export interface ReponseModification {
  resume: string;
  modifications?: { rechercher: string; remplacer: string }[];
  /** Page complète, seulement pour une refonte globale. */
  html?: string;
}

/** Prompt de modification : l'IA renvoie des remplacements ciblés, pas toute la page. */
export function promptModification(
  contexte: string,
  htmlActuel: string,
  demandesPrecedentes: string[],
  demande: string,
  imageJointe: string | null
): string {
  return [
    "Tu es directeur artistique et développeur front-end senior. Tu modifies le site web existant d'une petite entreprise.",
    "",
    contexte,
    "",
    A_EVITER,
    "",
    "=== CODE HTML ACTUEL DU SITE ===",
    htmlActuel,
    "",
    "=== DEMANDES PRÉCÉDENTES (contexte) ===",
    demandesPrecedentes.length ? demandesPrecedentes.map((d) => `- ${d}`).join("\n") : "(aucune)",
    "",
    "=== NOUVELLE DEMANDE À APPLIQUER ===",
    demande,
    imageJointe ? `Image fournie par l'utilisateur, à utiliser telle quelle là où la demande l'indique : ${imageJointe}` : "",
    "",
    "=== COMMENT RÉPONDRE ===",
    "Applique UNIQUEMENT cette demande. Ne change rien d'autre : ni les textes, ni la structure, ni le style de ce qui n'est pas concerné.",
    "Pour un changement de couleurs ou de polices, modifie d'abord les variables CSS dans :root, puis les éventuelles valeurs écrites en dur.",
    "Réponds en JSON, avec exactement cette forme :",
    `{"resume": "une phrase en français qui dit ce que tu as changé", "modifications": [{"rechercher": "...", "remplacer": "..."}]}`,
    "- « rechercher » : un extrait copié À L'IDENTIQUE du code actuel (espaces et retours à la ligne compris), assez long pour n'apparaître qu'une seule fois.",
    "- « remplacer » : le nouveau code qui prend sa place. Pour ajouter une section, recherche la balise qui la précède et remplace-la par elle-même suivie de la nouvelle section.",
    "- Seulement si la demande exige de refaire tout le site (refonte complète), renvoie à la place {\"resume\": \"...\", \"html\": \"<!DOCTYPE html>...</html>\"} avec la page complète.",
  ].join("\n");
}
