"use client";

import { useEffect, useId, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { cn } from "@/lib/cn";
import { FormError } from "@/components/ui/Field";
import {
  type ChampsProjet,
  type Projet,
  type StatutProjet,
  STATUTS_PROJET,
} from "@/data/projet";

/** Ce que le formulaire renvoie à ProjetsSection, qui parle à la base. */
export type ValeursProjet = Required<Pick<ChampsProjet, "intitule" | "statut">> &
  Pick<ChampsProjet, "description">;

type Props = {
  ouvert: boolean;
  /** Projet à modifier ; absent = création. */
  projet?: Projet | null;
  onFermer: () => void;
  onEnregistrer: (valeurs: ValeursProjet) => Promise<void>;
};

const CHAMP =
  "block w-full rounded-xl border border-border-strong bg-surface-container-lowest px-3.5 text-[15px] text-on-surface " +
  "placeholder:text-outline/60 transition-all duration-200 ease-out hover:border-outline/50 " +
  "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-surface-container";
const LIBELLE = "text-sm font-medium text-on-surface";

const BTN =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-[14px] font-semibold leading-none " +
  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2";
const BTN_CONTOUR = `${BTN} border border-outline-variant bg-surface-container-lowest text-on-surface hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-60`;
const BTN_PLEIN = `${BTN} bg-primary text-white hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-on-surface-variant`;

/** Valeurs initiales du formulaire à partir d'un projet existant (ou vides). */
function valeursInitiales(projet?: Projet | null) {
  return {
    intitule: projet?.intitule ?? "",
    description: projet?.description ?? "",
    statut: (projet?.statut ?? "idee") as StatutProjet,
  };
}

/**
 * Panneau latéral de création / modification d'un projet. Il glisse depuis
 * la droite (pleine largeur sur mobile) par-dessus un voile ; Échap ou le
 * voile le ferment. Seul l'intitulé est obligatoire. L'étude de faisabilité
 * ne se saisit pas ici : elle a son propre parcours par étapes
 * (/Projets/[id]/etude).
 */
export default function ProjetForm({ ouvert, projet, onFermer, onEnregistrer }: Props) {
  const reduceMotion = useReducedMotion();
  const id = useId();
  const [valeurs, setValeurs] = useState(() => valeursInitiales(projet));
  const [erreurIntitule, setErreurIntitule] = useState("");
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Réinitialise le formulaire à chaque ouverture (nouveau projet ou projet
  // différent) : on compare l'identité du projet, pas son contenu.
  const [precedent, setPrecedent] = useState<{ ouvert: boolean; id: string | null }>({
    ouvert,
    id: projet?.id ?? null,
  });
  if (precedent.ouvert !== ouvert || precedent.id !== (projet?.id ?? null)) {
    setPrecedent({ ouvert, id: projet?.id ?? null });
    setValeurs(valeursInitiales(projet));
    setErreurIntitule("");
    setErreur("");
  }

  // Échap ferme le panneau (sauf pendant l'enregistrement).
  useEffect(() => {
    if (!ouvert) return;
    const touche = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !envoi) onFermer();
    };
    document.addEventListener("keydown", touche);
    return () => document.removeEventListener("keydown", touche);
  }, [ouvert, envoi, onFermer]);

  const modifier = <K extends keyof typeof valeurs>(champ: K, valeur: (typeof valeurs)[K]) =>
    setValeurs((v) => ({ ...v, [champ]: valeur }));

  const soumettre = async (e: FormEvent) => {
    e.preventDefault();
    const intitule = valeurs.intitule.trim();
    if (!intitule) {
      setErreurIntitule("Donnez un intitulé à votre projet.");
      return;
    }
    setErreurIntitule("");
    setErreur("");
    setEnvoi(true);
    try {
      // Les zones vides deviennent null : la base distingue « rien saisi »
      // d'un texte vide, et les cartes affichent « Aucune description ».
      await onEnregistrer({
        intitule,
        statut: valeurs.statut,
        description: valeurs.description.trim() || null,
      });
    } catch (err) {
      setErreur((err as Error).message);
    } finally {
      setEnvoi(false);
    }
  };

  const edition = Boolean(projet);

  return (
    <AnimatePresence>
      {ouvert && (
        <>
          <motion.button
            type="button"
            aria-label="Fermer le panneau"
            onClick={() => !envoi && onFermer()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-[2px]"
          />

          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${id}-titre`}
            initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
            transition={
              reduceMotion ? { duration: 0.15 } : { type: "spring", stiffness: 380, damping: 38 }
            }
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-surface-container-lowest shadow-[-24px_0_48px_-24px_rgba(20,50,30,0.45)]"
          >
            <header className="flex items-start justify-between gap-4 border-b border-outline-variant px-5 py-4 sm:px-6">
              <div>
                <h2 id={`${id}-titre`} className="text-[20px] font-bold leading-7 text-on-surface">
                  {edition ? "Modifier le projet" : "Nouveau projet"}
                </h2>
                <p className="mt-0.5 text-[14px] text-on-surface">
                  {edition
                    ? "Mettez à jour les informations de ce projet."
                    : "Un intitulé suffit pour commencer : le reste peut attendre."}
                </p>
              </div>
              <button
                type="button"
                onClick={onFermer}
                disabled={envoi}
                aria-label="Fermer"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-on-surface transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              >
                <X size={20} weight="bold" aria-hidden="true" />
              </button>
            </header>

            <form
              id={`${id}-form`}
              onSubmit={soumettre}
              noValidate
              className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6"
            >
              <div className="space-y-1.5">
                <label htmlFor={`${id}-intitule`} className={cn(LIBELLE, erreurIntitule && "text-error")}>
                  Intitulé <span className="text-error">*</span>
                </label>
                <input
                  id={`${id}-intitule`}
                  value={valeurs.intitule}
                  onChange={(e) => modifier("intitule", e.target.value)}
                  placeholder="Ex. Ouverture d'un second point de vente"
                  maxLength={120}
                  required
                  autoFocus
                  aria-invalid={erreurIntitule ? true : undefined}
                  className={cn(CHAMP, "h-12", erreurIntitule && "border-error focus:border-error focus:ring-error/10")}
                />
                {erreurIntitule && (
                  <p role="alert" className="text-[13px] text-error">
                    {erreurIntitule}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${id}-description`} className={LIBELLE}>
                  Description
                </label>
                <textarea
                  id={`${id}-description`}
                  value={valeurs.description}
                  onChange={(e) => modifier("description", e.target.value)}
                  placeholder="En une ou deux phrases : de quoi s'agit-il, pour qui, pourquoi maintenant ?"
                  rows={3}
                  className={cn(CHAMP, "resize-y py-3")}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor={`${id}-statut`} className={LIBELLE}>
                  Statut
                </label>
                <select
                  id={`${id}-statut`}
                  value={valeurs.statut}
                  onChange={(e) => modifier("statut", e.target.value as StatutProjet)}
                  className={cn(CHAMP, "h-12")}
                >
                  {STATUTS_PROJET.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {erreur && <FormError>{erreur}</FormError>}
            </form>

            <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant px-5 py-4 sm:px-6">
              <button type="button" onClick={onFermer} disabled={envoi} className={BTN_CONTOUR}>
                Annuler
              </button>
              <button type="submit" form={`${id}-form`} disabled={envoi} className={BTN_PLEIN}>
                {envoi ? "Enregistrement…" : edition ? "Enregistrer" : "Créer le projet"}
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
