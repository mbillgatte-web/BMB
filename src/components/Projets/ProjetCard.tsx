"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowsClockwise,
  CaretLeft,
  CaretRight,
  Check,
  ClipboardText,
  DotsThreeVertical,
  PencilSimple,
  Trash,
} from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import {
  type Projet,
  type StatutProjet,
  STATUTS_PROJET,
  libelleStatut,
} from "@/data/projet";
import type { ResumeEtude } from "@/data/etudeFaisabilite";
import { AXES_ETUDE, etapeDeReprise } from "@/lib/questionsEtude";

type Props = {
  projet: Projet;
  /** Résumé de l'étude de faisabilité ; undefined = inconnu (pas chargé), null = pas commencée. */
  etude?: ResumeEtude | null;
  onModifier: (projet: Projet) => void;
  onChangerStatut: (projet: Projet, statut: StatutProjet) => Promise<void>;
  onSupprimer: (projet: Projet) => Promise<void>;
};

// Pastilles de statut : sobres, une teinte par étape du cycle de vie. Le
// vert de marque est réservé à « En cours » (le seul statut où l'on agit).
const PASTILLE: Record<StatutProjet, string> = {
  idee: "bg-surface-container text-on-surface",
  en_cours: "bg-primary/10 text-primary",
  termine: "bg-secondary-container/30 text-secondary",
  abandonne: "bg-surface-container-high text-on-surface-variant",
};

const LIGNE_MENU =
  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[14px] font-medium text-on-surface " +
  "transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:bg-primary/5";

const BTN =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold leading-none " +
  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const BTN_CONTOUR = `${BTN} border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-primary/5 hover:text-primary`;
const BTN_DANGER = `${BTN} bg-error text-on-error hover:bg-error/90`;

/** « Brouillon · étape 3/7 », « Générée »… ou « Pas commencée ». */
function etatEtude(etude: ResumeEtude | null): string {
  if (!etude) return "Pas commencée";
  if (etude.statut === "generee") return "Générée";
  if (etude.statut === "erreur") return "Erreur de génération";
  // etapeDeReprise va de 0 (premier axe) à AXES_ETUDE.length (récapitulatif).
  const etape = Math.min(etapeDeReprise(etude.reponses) + 1, AXES_ETUDE.length);
  return `Brouillon · étape ${etape}/${AXES_ETUDE.length}`;
}

function formaterDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

/**
 * Carte d'un projet dans la liste : intitulé, statut, date de création,
 * extrait de la description, un lien vers l'étude de faisabilité (avec son
 * avancement), et un menu « ⋮ » (Modifier / Changer de statut / Supprimer).
 * La suppression demande confirmation dans la carte elle-même,
 * sans modale, pour rester lisible sur mobile.
 */
export default function ProjetCard({ projet, etude, onModifier, onChangerStatut, onSupprimer }: Props) {
  const reduceMotion = useReducedMotion();
  const [menuOuvert, setMenuOuvert] = useState(false);
  // Sous-menu « Changer de statut » : remplace la liste principale dans le
  // même panneau (pas de menu flottant en cascade, trop fragile sur mobile).
  const [choixStatut, setChoixStatut] = useState(false);
  const [confirmation, setConfirmation] = useState(false);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  // Ferme le menu au clic à l'extérieur ou avec Échap.
  useEffect(() => {
    if (!menuOuvert) return;
    const fermer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOuvert(false);
    };
    const touche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOuvert(false);
    };
    document.addEventListener("mousedown", fermer);
    document.addEventListener("keydown", touche);
    return () => {
      document.removeEventListener("mousedown", fermer);
      document.removeEventListener("keydown", touche);
    };
  }, [menuOuvert]);

  const ouvrirMenu = () => {
    setChoixStatut(false);
    setMenuOuvert((v) => !v);
  };

  const changerStatut = async (statut: StatutProjet) => {
    setMenuOuvert(false);
    if (statut === projet.statut) return;
    setOccupe(true);
    setErreur("");
    try {
      await onChangerStatut(projet, statut);
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setOccupe(false);
    }
  };

  const supprimer = async () => {
    setOccupe(true);
    setErreur("");
    try {
      await onSupprimer(projet);
    } catch (err) {
      setErreur((err as Error).message);
      setOccupe(false);
      setConfirmation(false);
    }
  };

  return (
    <article
      className={cn(
        "relative flex h-full flex-col gap-3 rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md",
        occupe && "opacity-70"
      )}
      aria-busy={occupe || undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-[17px] font-bold leading-6 text-on-surface">{projet.intitule}</h3>
          <p className="mt-1 text-[13px] text-on-surface">
            Créé le {formaterDate(projet.created_at)}
          </p>
        </div>

        <div ref={menuRef} className="relative shrink-0">
          <button
            type="button"
            onClick={ouvrirMenu}
            aria-haspopup="menu"
            aria-expanded={menuOuvert}
            aria-label={`Actions pour ${projet.intitule}`}
            disabled={occupe}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <DotsThreeVertical size={22} weight="bold" aria-hidden="true" />
          </button>

          <AnimatePresence>
            {menuOuvert && (
              <motion.div
                role="menu"
                initial={reduceMotion ? false : { opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.16, ease: [0.2, 0.7, 0.2, 1] }}
                className="absolute right-0 top-10 z-20 w-56 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest py-1 shadow-[0_16px_32px_-16px_rgba(20,50,30,0.45)]"
              >
                {choixStatut ? (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => setChoixStatut(false)}
                      className={cn(LIGNE_MENU, "text-on-surface-variant")}
                    >
                      <CaretLeft size={16} weight="bold" aria-hidden="true" />
                      Changer de statut
                    </button>
                    <div className="my-1 h-px bg-outline-variant" />
                    {STATUTS_PROJET.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        role="menuitemradio"
                        aria-checked={s.value === projet.statut}
                        onClick={() => changerStatut(s.value)}
                        className={LIGNE_MENU}
                      >
                        <span className="flex w-4 justify-center">
                          {s.value === projet.statut && (
                            <Check size={16} weight="bold" aria-hidden="true" />
                          )}
                        </span>
                        {s.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOuvert(false);
                        onModifier(projet);
                      }}
                      className={LIGNE_MENU}
                    >
                      <PencilSimple size={18} weight="duotone" aria-hidden="true" />
                      Modifier
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => setChoixStatut(true)}
                      className={LIGNE_MENU}
                    >
                      <ArrowsClockwise size={18} weight="duotone" aria-hidden="true" />
                      Changer de statut
                    </button>
                    <div className="my-1 h-px bg-outline-variant" />
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setMenuOuvert(false);
                        setConfirmation(true);
                      }}
                      className={cn(LIGNE_MENU, "text-error hover:bg-error/5 hover:text-error")}
                    >
                      <Trash size={18} weight="duotone" aria-hidden="true" />
                      Supprimer
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <span
        className={cn(
          "inline-flex w-fit items-center rounded-md px-2.5 py-1 text-[12px] font-semibold leading-4",
          PASTILLE[projet.statut]
        )}
      >
        {libelleStatut(projet.statut)}
      </span>

      {projet.description ? (
        <p className="line-clamp-3 text-[14px] leading-[22px] text-on-surface">{projet.description}</p>
      ) : (
        <p className="text-[14px] leading-[22px] text-on-surface-variant">Aucune description pour l&apos;instant.</p>
      )}

      {/* Lien vers le questionnaire de l'étude, poussé en bas de la carte. */}
      <Link
        href={`/Projets/${projet.id}/etude`}
        className="group/etude mt-auto flex items-center gap-2.5 rounded-xl border border-outline-variant px-3 py-2.5 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        <ClipboardText
          size={20}
          weight="duotone"
          aria-hidden="true"
          className="shrink-0 text-on-surface-variant transition-colors group-hover/etude:text-primary"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold leading-5 text-on-surface transition-colors group-hover/etude:text-primary">
            Étude de faisabilité
          </span>
          {etude !== undefined && (
            <span className="block text-[12px] leading-4 text-on-surface-variant">{etatEtude(etude)}</span>
          )}
        </span>
        <CaretRight
          size={16}
          weight="bold"
          aria-hidden="true"
          className="shrink-0 text-on-surface-variant transition-transform group-hover/etude:translate-x-0.5 group-hover/etude:text-primary"
        />
      </Link>

      {erreur && (
        <p role="alert" className="text-[13px] text-error">
          {erreur}
        </p>
      )}

      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 z-10 flex flex-col justify-center gap-4 rounded-2xl bg-surface-container-lowest p-5"
            role="alertdialog"
            aria-label={`Supprimer ${projet.intitule}`}
          >
            <p className="text-[15px] leading-6 text-on-surface">
              Supprimer <strong>{projet.intitule}</strong> ? Son étude de faisabilité sera perdue
              aussi. Cette action est définitive.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setConfirmation(false)}
                disabled={occupe}
                className={BTN_CONTOUR}
              >
                Annuler
              </button>
              <button type="button" onClick={supprimer} disabled={occupe} className={BTN_DANGER}>
                <Trash size={16} weight="bold" aria-hidden="true" />
                {occupe ? "Suppression…" : "Supprimer"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
