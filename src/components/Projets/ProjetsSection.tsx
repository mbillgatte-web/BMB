"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Briefcase, Plus, WarningCircle } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase/browser";
import { useEntreprise } from "@/hooks/useEntreprise";
import {
  type Projet,
  type StatutProjet,
  creerProjet,
  listProjetsDeLEntreprise,
  mettreAJourProjet,
  supprimerProjet,
} from "@/data/projet";
import ProjetCard from "./ProjetCard";
import ProjetForm, { type ValeursProjet } from "./ProjetForm";

const BTN =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold leading-none " +
  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2";
const BTN_PLEIN = `${BTN} bg-primary text-white hover:bg-primary-hover`;
const BTN_CONTOUR = `${BTN} border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-primary/5 hover:text-primary`;

/**
 * Section « Projets » : la liste des projets de l'entreprise sélectionnée
 * (voir useEntreprise), un état vide, et le panneau de création / édition
 * (ProjetForm). Les lectures et écritures passent par le client navigateur
 * et les fonctions de src/data/projet.ts, comme le font les écrans du site
 * web ; la RLS garantit qu'un compte ne voit que ses projets.
 */
export default function ProjetsSection() {
  const reduceMotion = useReducedMotion();
  const { entreprise, loading: loadingEntreprise, error: erreurEntreprise } = useEntreprise();

  const [projets, setProjets] = useState<Projet[]>([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [panneauOuvert, setPanneauOuvert] = useState(false);
  const [projetEnEdition, setProjetEnEdition] = useState<Projet | null>(null);

  const entrepriseId = entreprise?.id ?? null;

  const charger = useCallback(async () => {
    if (!entrepriseId) return;
    setChargement(true);
    setErreur("");
    try {
      setProjets(await listProjetsDeLEntreprise(supabase, entrepriseId));
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setChargement(false);
    }
  }, [entrepriseId]);

  // Recharge la liste à chaque changement d'entreprise sélectionnée (le
  // sélecteur de la Sidebar peut en changer sans quitter la page). La remise
  // à zéro se fait PENDANT le rendu (même technique que useIdentiteVisuelle)
  // pour ne pas appeler setState de façon synchrone dans l'effet.
  const [prevEntrepriseId, setPrevEntrepriseId] = useState(entrepriseId);
  if (entrepriseId !== prevEntrepriseId) {
    setPrevEntrepriseId(entrepriseId);
    setProjets([]);
    setChargement(true);
    setErreur("");
  }

  useEffect(() => {
    if (!entrepriseId) return;
    let annule = false;
    listProjetsDeLEntreprise(supabase, entrepriseId)
      .then((liste) => {
        if (!annule) setProjets(liste);
      })
      .catch((err: Error) => {
        if (!annule) setErreur(err.message);
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [entrepriseId]);

  const ouvrirCreation = () => {
    setProjetEnEdition(null);
    setPanneauOuvert(true);
  };

  const ouvrirEdition = (projet: Projet) => {
    setProjetEnEdition(projet);
    setPanneauOuvert(true);
  };

  const fermerPanneau = useCallback(() => setPanneauOuvert(false), []);

  // Création / modification : on met la liste à jour localement avec la
  // ligne renvoyée par la base (pas de rechargement complet) et on ferme le
  // panneau. Les erreurs remontent au formulaire, qui les affiche.
  const enregistrer = async (valeurs: ValeursProjet) => {
    if (!entrepriseId) return;
    if (projetEnEdition) {
      const maj = await mettreAJourProjet(supabase, projetEnEdition.id, valeurs);
      setProjets((liste) => liste.map((p) => (p.id === maj.id ? maj : p)));
    } else {
      const nouveau = await creerProjet(supabase, { entrepriseId, ...valeurs });
      setProjets((liste) => [nouveau, ...liste]);
    }
    setPanneauOuvert(false);
  };

  const changerStatut = async (projet: Projet, statut: StatutProjet) => {
    const maj = await mettreAJourProjet(supabase, projet.id, { statut });
    setProjets((liste) => liste.map((p) => (p.id === maj.id ? maj : p)));
  };

  const supprimer = async (projet: Projet) => {
    await supprimerProjet(supabase, projet.id);
    setProjets((liste) => liste.filter((p) => p.id !== projet.id));
  };

  // --- États sans liste --------------------------------------------------

  if (loadingEntreprise) {
    return (
      <div className="flex flex-col gap-lg">
        <EnTete />
        <Squelette />
      </div>
    );
  }

  if (erreurEntreprise) {
    return (
      <div className="flex flex-col gap-lg">
        <EnTete />
        <Probleme titre="Impossible de charger vos entreprises" detail={erreurEntreprise} />
      </div>
    );
  }

  if (!entreprise) {
    return (
      <div className="flex flex-col gap-lg">
        <EnTete />
        <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 sm:p-8">
          <p className="text-[16px] font-bold text-on-surface">Aucune entreprise pour l&apos;instant</p>
          <p className="mt-1 max-w-[52ch] text-[15px] leading-6 text-on-surface">
            Un projet appartient toujours à une entreprise. Créez d&apos;abord la vôtre, puis revenez ici
            pour y rattacher vos projets.
          </p>
          <Link href="/BuildEntreprise" className={`${BTN_PLEIN} mt-5`}>
            <Plus size={16} weight="bold" aria-hidden="true" />
            Créer mon entreprise
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-lg">
      <EnTete
        sousTitre={`Les projets de ${entreprise.nom}.`}
        action={
          !chargement && !erreur && projets.length > 0 ? (
            <button type="button" onClick={ouvrirCreation} className={BTN_PLEIN}>
              <Plus size={16} weight="bold" aria-hidden="true" />
              Nouveau projet
            </button>
          ) : undefined
        }
      />

      {chargement ? (
        <Squelette />
      ) : erreur ? (
        <Probleme titre="Impossible de charger les projets" detail={erreur}>
          <button type="button" onClick={charger} className={BTN_CONTOUR}>
            Réessayer
          </button>
        </Probleme>
      ) : projets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-6 sm:p-8">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Briefcase size={24} weight="duotone" aria-hidden="true" />
          </span>
          <p className="mt-4 text-[16px] font-bold text-on-surface">
            {entreprise.nom} n&apos;a encore aucun projet
          </p>
          <p className="mt-1 max-w-[52ch] text-[15px] leading-6 text-on-surface">
            Un projet, c&apos;est une initiative précise : ouvrir un second point de vente, lancer la
            livraison, créer une nouvelle gamme. Commencez par lui donner un nom.
          </p>
          <button type="button" onClick={ouvrirCreation} className={`${BTN_PLEIN} mt-5`}>
            <Plus size={16} weight="bold" aria-hidden="true" />
            Créer mon premier projet
          </button>
        </div>
      ) : (
        <motion.ul
          role="list"
          className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3"
          initial={reduceMotion ? false : "cache"}
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        >
          <AnimatePresence initial={false}>
            {projets.map((projet) => (
              <motion.li
                key={projet.id}
                layout={!reduceMotion}
                variants={{
                  cache: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0 },
                }}
                exit={reduceMotion ? undefined : { opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
              >
                <ProjetCard
                  projet={projet}
                  onModifier={ouvrirEdition}
                  onChangerStatut={changerStatut}
                  onSupprimer={supprimer}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}

      <ProjetForm
        ouvert={panneauOuvert}
        projet={projetEnEdition}
        onFermer={fermerPanneau}
        onEnregistrer={enregistrer}
      />
    </div>
  );
}

// --- Petits blocs d'affichage ---------------------------------------------

function EnTete({ sousTitre, action }: { sousTitre?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Projets</h1>
        <p className="mt-1 text-[15px] leading-6 text-on-surface">
          {sousTitre ?? "Les initiatives que mène votre entreprise, de l'idée à la réalisation."}
        </p>
      </div>
      {action}
    </div>
  );
}

function Squelette() {
  return (
    <div className="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-[180px] animate-pulse rounded-2xl border border-outline-variant bg-surface-container-low"
        />
      ))}
    </div>
  );
}

/** Erreur de lecture : message clair + détail technique, pour comprendre
    sans ouvrir la console (ex. table pas encore créée en base). */
function Probleme({
  titre,
  detail,
  children,
}: {
  titre: string;
  detail: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-2xl border border-error/20 bg-error-container/30 p-5 sm:flex-row sm:items-start sm:gap-4"
    >
      <WarningCircle size={24} weight="duotone" className="shrink-0 text-error" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-[16px] font-bold text-on-surface">{titre}</p>
        <p className="mt-1 break-words font-mono text-[13px] leading-5 text-on-error-container">{detail}</p>
        {children && <div className="mt-4">{children}</div>}
      </div>
    </div>
  );
}
