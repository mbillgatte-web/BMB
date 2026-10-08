// Questionnaire de l'étude de faisabilité : 7 axes, un par écran du
// formulaire (src/components/Etude/EtudeFaisabiliteForm.tsx).
//
// C'est la SEULE source de vérité des questions : les identifiants (`id`,
// forme « axe.cle ») sont les clés de la colonne `reponses` (jsonb) de la
// table etude_faisabilite. Changer un id ici rend illisibles les réponses
// déjà enregistrées sous l'ancien id : ajouter une question est sans risque,
// en renommer une ne l'est pas.
//
// Toutes les questions sont optionnelles : l'entrepreneur répond à ce qu'il
// sait, et peut dire « Je ne sais pas » (valeur null) sur le reste. L'IA
// qui rédigera l'étude (étape ultérieure) devra composer avec ces trous.

export type TypeQuestion =
  | "texte" // paragraphe libre (textarea)
  | "texte_court" // une ligne
  | "nombre" // entier (clients, personnes…)
  | "montant" // somme en FCFA
  | "choix" // une seule option
  | "choix_multiple"; // plusieurs options

export interface OptionQuestion {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  libelle: string;
  /** Exemple ou précision affichée sous le champ. */
  aide?: string;
  type: TypeQuestion;
  /** Pour `choix` et `choix_multiple` uniquement. */
  options?: OptionQuestion[];
  /** Toujours false pour l'instant : aucune question n'est bloquante. */
  obligatoire?: false;
}

export interface AxeEtude {
  id: string;
  titre: string;
  /** Une phrase qui explique à quoi sert cet axe, affichée sous le titre. */
  intro: string;
  questions: Question[];
}

/**
 * Valeur d'une réponse selon le type de question :
 * - texte / texte_court / choix : string ;
 * - nombre / montant : number ;
 * - choix_multiple : string[] ;
 * - null : « Je ne sais pas » (différent d'une question absente = pas
 *   encore répondue).
 */
export type ReponsesEtude = Record<string, string | number | string[] | null>;

export const AXES_ETUDE: AxeEtude[] = [
  {
    id: "projet",
    titre: "Définir le projet",
    intro: "En quelques mots : l'idée, et le problème qu'elle résout.",
    questions: [
      {
        id: "projet.idee",
        libelle: "Quelle est votre idée en une ou deux phrases ?",
        type: "texte",
      },
      {
        id: "projet.probleme_cible",
        libelle: "Quel problème résout-elle, et pour qui ?",
        aide: "Exemple : « Les étudiants du campus n'ont pas de repas rapides et sains à moins de 2 000 FCFA. »",
        type: "texte",
      },
    ],
  },
  {
    id: "marche",
    titre: "Étudier le marché",
    intro: "Qui fait déjà la même chose, et combien de clients vous visez.",
    questions: [
      {
        id: "marche.concurrents",
        libelle: "Qui sont vos concurrents, et que leur reprochent leurs clients ?",
        type: "texte",
      },
      {
        id: "marche.clients_par_mois",
        libelle: "Combien de clients pensez-vous toucher par mois au démarrage ?",
        type: "nombre",
      },
    ],
  },
  {
    id: "offre",
    titre: "Offre et modèle économique",
    intro: "Ce que vous vendez, à quel prix, et comment l'argent rentre.",
    questions: [
      {
        id: "offre.produit",
        libelle: "Que vendez-vous exactement ?",
        type: "texte",
      },
      {
        id: "offre.prix_moyen",
        libelle: "À quel prix moyen ?",
        type: "montant",
      },
      {
        id: "offre.modele_revenus",
        libelle: "Comment gagnez-vous de l'argent ?",
        type: "choix",
        options: [
          { value: "vente_directe", label: "Vente directe" },
          { value: "abonnement", label: "Abonnement" },
          { value: "commission", label: "Commission" },
          { value: "location", label: "Location" },
          { value: "autre", label: "Autre" },
        ],
      },
    ],
  },
  {
    id: "technique",
    titre: "Faisabilité technique et moyens",
    intro: "Ce qu'il faut réunir pour démarrer, et si vous savez le faire.",
    questions: [
      {
        id: "technique.besoins",
        libelle: "De quoi avez-vous besoin pour démarrer : local, matériel, outils, autorisations ?",
        type: "texte",
      },
      {
        id: "technique.competences",
        libelle: "Avez-vous les compétences nécessaires ?",
        type: "choix",
        options: [
          { value: "oui", label: "Oui, je les ai" },
          { value: "partiel", label: "En partie, je dois me former" },
          { value: "recruter", label: "Non, je dois recruter" },
        ],
      },
    ],
  },
  {
    id: "operations",
    titre: "Organisation et opérations",
    intro: "Comment vous vendez, livrez, et avec qui.",
    questions: [
      {
        id: "operations.canaux",
        libelle: "Comment allez-vous vendre et livrer ?",
        type: "choix_multiple",
        options: [
          { value: "sur_place", label: "Sur place" },
          { value: "livraison", label: "Livraison" },
          { value: "en_ligne", label: "En ligne" },
          { value: "reseaux_sociaux", label: "Réseaux sociaux" },
          { value: "revendeurs", label: "Revendeurs" },
        ],
      },
      {
        id: "operations.effectif",
        libelle: "Combien de personnes travailleront avec vous au départ ?",
        type: "nombre",
      },
    ],
  },
  {
    id: "financier",
    titre: "Étude financière",
    intro: "Des ordres de grandeur suffisent : ce que ça coûte, ce que vous avez.",
    questions: [
      {
        id: "financier.cout_demarrage",
        libelle: "Coût total de démarrage estimé ?",
        type: "montant",
      },
      {
        id: "financier.charges_fixes",
        libelle: "Dépenses mensuelles fixes (loyer, salaires, énergie, abonnements) ?",
        type: "montant",
      },
      {
        id: "financier.cout_variable",
        libelle: "Pour une vente, combien vous coûtent directement les matières ou marchandises ?",
        aide: "Exemple : un plat vendu 2 500 FCFA dont les ingrédients coûtent 1 500 FCFA. Ne comptez pas le loyer ni les salaires.",
        type: "montant",
      },
      // Les deux questions suivantes forment un même sujet (le financement)
      // et s'affichent côte à côte : voir GROUPES_SUR_UNE_LIGNE.
      {
        id: "financier.apport",
        libelle: "Combien d'argent avez-vous déjà ?",
        type: "montant",
      },
      {
        id: "financier.source_financement",
        libelle: "D'où viendra le reste ?",
        type: "choix",
        options: [
          { value: "epargne", label: "Mon épargne" },
          { value: "famille", label: "Famille et proches" },
          { value: "pret", label: "Prêt bancaire ou microfinance" },
          { value: "investisseur", label: "Investisseur" },
          { value: "aucun_besoin", label: "Je n'ai pas besoin du reste" },
        ],
      },
    ],
  },
  {
    id: "risques",
    titre: "Risques et calendrier",
    intro: "Ce qui pourrait mal tourner, et quand vous voulez démarrer.",
    questions: [
      {
        id: "risques.principaux",
        libelle: "Qu'est-ce qui pourrait faire échouer le projet ?",
        type: "texte",
      },
      {
        id: "risques.delai_lancement",
        libelle: "Dans combien de temps voulez-vous démarrer ?",
        type: "choix",
        options: [
          { value: "moins_3_mois", label: "Moins de 3 mois" },
          { value: "3_6_mois", label: "Entre 3 et 6 mois" },
          { value: "plus_6_mois", label: "Plus de 6 mois" },
        ],
      },
    ],
  },
];

/**
 * Paires de questions à afficher sur une même ligne (côte à côte sur
 * écran large, l'une sous l'autre sur mobile). Le formulaire les repère
 * par l'id de la première.
 */
export const GROUPES_SUR_UNE_LIGNE: [string, string][] = [
  ["financier.apport", "financier.source_financement"],
];

/** Toutes les questions à plat, dans l'ordre des axes. */
export const TOUTES_LES_QUESTIONS: Question[] = AXES_ETUDE.flatMap((axe) => axe.questions);

/**
 * Axe où reprendre le questionnaire : le premier dont aucune question n'a de
 * clé dans `reponses`. « Je ne sais pas » enregistre `null`, donc un axe
 * visité laisse toujours une trace. Si tous les axes ont été vus, renvoie
 * AXES_ETUDE.length (= écran récapitulatif).
 */
export function etapeDeReprise(reponses: ReponsesEtude): number {
  const index = AXES_ETUDE.findIndex((axe) => axe.questions.every((q) => !(q.id in reponses)));
  return index === -1 ? AXES_ETUDE.length : index;
}

/** Libellé lisible d'une valeur d'option ("pret" -> "Prêt bancaire ou microfinance"). */
export function libelleOption(question: Question, value: string): string {
  return question.options?.find((o) => o.value === value)?.label ?? value;
}
