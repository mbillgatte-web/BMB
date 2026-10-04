"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check, FloppyDisk, PencilSimple, WarningCircle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/Field";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase/browser";
import { enregistrerReponses, type EtudeFaisabilite } from "@/data/etudeFaisabilite";
import type { Projet } from "@/data/projet";
import {
  AXES_ETUDE,
  GROUPES_SUR_UNE_LIGNE,
  etapeDeReprise,
  libelleOption,
  type Question,
  type ReponsesEtude,
} from "@/lib/questionsEtude";

type Props = {
  projet: Projet;
  /** Étude déjà enregistrée (réponses + étape où reprendre) ; null = pas commencée. */
  etude: EtudeFaisabilite | null;
};

/** Index de l'écran récapitulatif, juste après le dernier axe. */
const ETAPE_RECAP = AXES_ETUDE.length;

const SECONDES = { duration: 0.25, ease: [0.2, 0.7, 0.2, 1] as const };

// --- Formatage des nombres ---------------------------------------------------

/** "1500000" -> "1 500 000" (espace insécable fine, comme en typographie française). */
function formaterMilliers(n: number): string {
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

/** Ne garde que les chiffres d'une saisie, ou null si rien n'en reste. */
function lireEntier(texte: string): number | null {
  const chiffres = texte.replace(/\D/g, "");
  return chiffres ? Number(chiffres) : null;
}

/** Texte affiché dans un champ numérique : formaté pour les montants, brut sinon. */
function texteDuNombre(valeur: ReponsesEtude[string] | undefined, montant: boolean): string {
  if (typeof valeur !== "number") return "";
  return montant ? formaterMilliers(valeur) : String(valeur);
}

// --- Composant ---------------------------------------------------------------

/**
 * Questionnaire de l'étude de faisabilité, un axe par écran (7 écrans) puis
 * un récapitulatif. Les réponses vivent en mémoire et sont enregistrées en
 * base à chaque changement d'écran (Suivant / Retour), ou via « Enregistrer
 * et quitter ». Une question peut être laissée vide (pas encore répondue)
 * ou marquée « Je ne sais pas » (null) : la différence compte pour l'IA qui
 * rédigera l'étude plus tard.
 */
export default function EtudeFaisabiliteForm({ projet, etude }: Props) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const [reponses, setReponses] = useState<ReponsesEtude>(() => etude?.reponses ?? {});
  // On reprend là où l'entrepreneur s'était arrêté (borné au cas où le
  // nombre d'axes aurait changé depuis).
  const [etape, setEtape] = useState(() => (etude ? Math.min(etapeDeReprise(etude.reponses), ETAPE_RECAP) : 0));
  const [direction, setDirection] = useState(1);
  const [enregistrement, setEnregistrement] = useState(false);
  const [erreur, setErreur] = useState("");
  const [enregistreLe, setEnregistreLe] = useState<Date | null>(
    etude ? new Date(etude.updated_at) : null
  );
  const racine = useRef<HTMLDivElement>(null);

  /**
   * Enregistre l'état courant. Renvoie true si ça a marché. En cas d'échec
   * on affiche l'erreur mais on ne bloque pas la navigation : les réponses
   * restent en mémoire et seront renvoyées (en entier) au prochain essai.
   */
  const enregistrer = useCallback(
    async (): Promise<boolean> => {
      setEnregistrement(true);
      setErreur("");
      try {
        const maj = await enregistrerReponses(supabase, projet.id, reponses);
        setEnregistreLe(new Date(maj.updated_at));
        return true;
      } catch (err) {
        setErreur((err as Error).message);
        return false;
      } finally {
        setEnregistrement(false);
      }
    },
    [projet.id, reponses]
  );

  const allerA = async (cible: number) => {
    setDirection(cible > etape ? 1 : -1);
    await enregistrer();
    setEtape(cible);
    // Remonte en haut du nouvel écran : sur mobile, les boutons sont en bas.
    // (scrollIntoView et non window.scrollTo : c'est <main> qui défile.)
    racine.current?.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  };

  const enregistrerEtQuitter = async () => {
    if (await enregistrer()) router.push("/Projets");
  };

  const modifier = (id: string, valeur: ReponsesEtude[string] | undefined) =>
    setReponses((r) => {
      const suivant = { ...r };
      // undefined = « pas encore répondue » : on retire la clé plutôt que
      // de stocker une chaîne vide.
      if (valeur === undefined || valeur === "") delete suivant[id];
      else suivant[id] = valeur;
      return suivant;
    });

  const decalage = reduceMotion ? 0 : 24;
  const recap = etape === ETAPE_RECAP;
  const axe = recap ? null : AXES_ETUDE[etape];

  return (
    <div ref={racine} className="flex flex-col gap-lg scroll-mt-6">
      {/* En-tête : projet concerné + progression en 7 segments (même
          dessin que l'inscription). */}
      <div>
        <p className="text-[13px] font-semibold uppercase tracking-wide text-primary">
          Étude de faisabilité
        </p>
        <h1 className="mt-1 font-headline-lg text-headline-lg text-on-surface">{projet.intitule}</h1>

        <div className="mt-6 flex gap-2" aria-hidden="true">
          {AXES_ETUDE.map((a, i) => (
            <span key={a.id} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-container-high">
              <motion.span
                className="block h-full origin-left rounded-full bg-primary"
                initial={false}
                animate={{ scaleX: i <= etape ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-on-surface-variant">
          <span className="font-medium text-on-surface">
            {recap ? "Récapitulatif" : `Étape ${etape + 1} sur ${AXES_ETUDE.length} · ${axe?.titre}`}
          </span>
          <span className="block">
            {recap ? "Relisez vos réponses avant de passer à la suite." : axe?.intro}
          </span>
        </p>
      </div>

      {erreur && (
        <div
          role="alert"
          className="animate-rise-in flex items-start gap-3 rounded-2xl border border-error/20 bg-error-container/30 p-4"
        >
          <WarningCircle size={22} weight="duotone" className="shrink-0 text-error" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-bold text-on-surface">Impossible d&apos;enregistrer vos réponses</p>
            <p className="mt-0.5 text-[14px] leading-5 text-on-surface">
              Elles restent sur cet écran : réessayez au prochain changement d&apos;étape ou avec
              « Enregistrer et quitter ».
            </p>
            <p className="mt-1.5 break-words font-mono text-[12px] leading-5 text-on-error-container">{erreur}</p>
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!recap) allerA(etape + 1);
        }}
        noValidate
        className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 sm:p-8"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={etape}
            custom={direction}
            initial={{ opacity: 0, x: direction * decalage }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -decalage }}
            transition={{ duration: reduceMotion ? 0 : SECONDES.duration, ease: SECONDES.ease }}
          >
            {axe ? (
              <div className="space-y-6">
                {grouperQuestions(axe.questions).map((groupe) => (
                  <div
                    key={groupe[0].id}
                    className={cn(groupe.length > 1 && "grid grid-cols-1 gap-6 sm:grid-cols-2")}
                  >
                    {groupe.map((q) => (
                      <ChampQuestion
                        key={q.id}
                        question={q}
                        valeur={reponses[q.id]}
                        repondue={q.id in reponses}
                        onChange={(v) => modifier(q.id, v)}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <Recapitulatif reponses={reponses} onModifier={(i) => allerA(i)} />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Boutons : Retour / Suivant (ou Terminer), et Enregistrer et
            quitter. Sur mobile ils passent l'un sous l'autre. */}
        <div className="mt-8 flex flex-col gap-3 border-t border-outline-variant pt-6 sm:flex-row sm:items-center">
          {etape > 0 && (
            <Button
              variant="ghost"
              size="lg"
              onClick={() => allerA(etape - 1)}
              disabled={enregistrement}
              className="shrink-0 justify-center px-3"
            >
              <ArrowLeft size={16} weight="bold" aria-hidden="true" />
              Retour
            </Button>
          )}

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:justify-end">
            {!recap && (
              <Button
                variant="secondary"
                size="lg"
                onClick={enregistrerEtQuitter}
                loading={enregistrement}
                className="justify-center"
              >
                <FloppyDisk size={16} weight="bold" aria-hidden="true" />
                Enregistrer et quitter
              </Button>
            )}
            {recap ? (
              <Button type="button" size="lg" disabled className="justify-center" arrows={false}>
                Générer l&apos;étude
              </Button>
            ) : (
              <Button type="submit" size="lg" loading={enregistrement} className="justify-center">
                {etape === AXES_ETUDE.length - 1 ? "Terminer" : "Suivant"}
              </Button>
            )}
          </div>
        </div>

        <p className="mt-3 text-right text-[13px] text-on-surface-variant" aria-live="polite">
          {recap
            ? "La génération arrive dans la prochaine étape."
            : enregistrement
              ? "Enregistrement…"
              : enregistreLe
                ? `Enregistré à ${enregistreLe.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
                : "Vos réponses sont enregistrées à chaque changement d'étape."}
        </p>
      </form>
    </div>
  );
}

// --- Groupes de questions ------------------------------------------------------

/**
 * Découpe les questions d'un axe en lignes : une question par ligne, sauf
 * les paires listées dans GROUPES_SUR_UNE_LIGNE qui partagent la leur.
 */
function grouperQuestions(questions: Question[]): Question[][] {
  const lignes: Question[][] = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const paire = GROUPES_SUR_UNE_LIGNE.find(([premiere]) => premiere === q.id);
    if (paire && questions[i + 1]?.id === paire[1]) {
      lignes.push([q, questions[i + 1]]);
      i++;
    } else {
      lignes.push([q]);
    }
  }
  return lignes;
}

// --- Un champ par question --------------------------------------------------------

type ChampProps = {
  question: Question;
  valeur: ReponsesEtude[string] | undefined;
  /** La clé existe dans les réponses (y compris avec null = « Je ne sais pas »). */
  repondue: boolean;
  onChange: (valeur: ReponsesEtude[string] | undefined) => void;
};

/**
 * Affiche le bon type de champ pour une question, avec le lien « Je ne
 * sais pas » à droite du libellé. Quand il est actif, la valeur est null et
 * le champ est désactivé (grisé) ; un second clic le réactive, vide.
 */
function ChampQuestion({ question, valeur, repondue, onChange }: ChampProps) {
  const neSaitPas = repondue && valeur === null;

  const basculer = () => onChange(neSaitPas ? undefined : null);

  const lien = (
    <button
      type="button"
      onClick={basculer}
      aria-pressed={neSaitPas}
      className={cn(
        "shrink-0 rounded-md px-1.5 py-0.5 text-[12px] font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        neSaitPas
          ? "bg-primary/10 text-primary hover:bg-primary/15"
          : "text-on-surface-variant hover:bg-primary/5 hover:text-primary"
      )}
    >
      {neSaitPas ? "Répondre" : "Je ne sais pas"}
    </button>
  );

  const commun = {
    label: question.libelle,
    labelAside: lien,
    hint: neSaitPas ? "Marquée « Je ne sais pas »." : question.aide,
    disabled: neSaitPas,
  };

  switch (question.type) {
    case "texte":
      return (
        <TextAreaField
          {...commun}
          value={typeof valeur === "string" ? valeur : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={neSaitPas ? "" : "Écrivez librement…"}
        />
      );

    case "texte_court":
      return (
        <TextField
          {...commun}
          value={typeof valeur === "string" ? valeur : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "nombre":
    case "montant": {
      const montant = question.type === "montant";
      return (
        <TextField
          {...commun}
          inputMode="numeric"
          autoComplete="off"
          suffix={montant ? "FCFA" : undefined}
          placeholder={neSaitPas ? "" : "0"}
          value={texteDuNombre(valeur, montant)}
          onChange={(e) => onChange(lireEntier(e.target.value) ?? undefined)}
        />
      );
    }

    case "choix":
      return (
        <SelectField
          {...commun}
          placeholder="Choisir…"
          options={question.options ?? []}
          value={typeof valeur === "string" ? valeur : ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case "choix_multiple": {
      const choisis = Array.isArray(valeur) ? valeur : [];
      const basculerOption = (v: string) => {
        const suivant = choisis.includes(v) ? choisis.filter((x) => x !== v) : [...choisis, v];
        onChange(suivant.length ? suivant : undefined);
      };
      return (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <p id={`${question.id}-libelle`} className="text-sm font-medium text-on-surface">
              {question.libelle}
            </p>
            {lien}
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby={`${question.id}-libelle`}>
            {(question.options ?? []).map((o) => {
              const actif = choisis.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={actif}
                  disabled={neSaitPas}
                  onClick={() => basculerOption(o.value)}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/10",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    actif
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border-strong bg-surface-container-low text-on-surface hover:border-outline/50"
                  )}
                >
                  {actif && <Check size={14} weight="bold" aria-hidden="true" />}
                  {o.label}
                </button>
              );
            })}
          </div>
          {commun.hint && <p className="text-[13px] text-on-surface-variant">{commun.hint}</p>}
        </div>
      );
    }
  }
}

// --- Récapitulatif --------------------------------------------------------------

/** Texte affiché pour une réponse dans le récapitulatif. */
function texteReponse(question: Question, valeur: ReponsesEtude[string] | undefined): {
  texte: string;
  vide: boolean;
} {
  if (valeur === undefined || valeur === "") return { texte: "Non renseigné", vide: true };
  if (valeur === null) return { texte: "Je ne sais pas", vide: true };
  if (typeof valeur === "number") {
    return {
      texte: question.type === "montant" ? `${formaterMilliers(valeur)} FCFA` : formaterMilliers(valeur),
      vide: false,
    };
  }
  if (Array.isArray(valeur)) {
    return { texte: valeur.map((v) => libelleOption(question, v)).join(", "), vide: false };
  }
  if (question.type === "choix") return { texte: libelleOption(question, valeur), vide: false };
  return { texte: valeur, vide: false };
}

function Recapitulatif({
  reponses,
  onModifier,
}: {
  reponses: ReponsesEtude;
  onModifier: (indexAxe: number) => void;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.dl
      className="divide-y divide-outline-variant"
      initial={reduceMotion ? false : "cache"}
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
    >
      {AXES_ETUDE.map((axe, i) => (
        <motion.div
          key={axe.id}
          variants={{ cache: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
          className="py-5 first:pt-0 last:pb-0"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-on-surface">
              <span className="mr-2 text-on-surface-variant">{i + 1}.</span>
              {axe.titre}
            </h2>
            <button
              type="button"
              onClick={() => onModifier(i)}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2 text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              <PencilSimple size={14} weight="bold" aria-hidden="true" />
              Modifier
            </button>
          </div>
          <div className="mt-3 space-y-3">
            {axe.questions.map((q) => {
              const { texte, vide } = texteReponse(q, reponses[q.id]);
              return (
                <div key={q.id}>
                  <dt className="text-[13px] text-on-surface-variant">{q.libelle}</dt>
                  <dd
                    className={cn(
                      "mt-0.5 whitespace-pre-line break-words text-[15px] leading-6",
                      vide ? "italic text-on-surface-variant" : "text-on-surface"
                    )}
                  >
                    {texte}
                  </dd>
                </div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </motion.dl>
  );
}
