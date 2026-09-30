"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, Mic, Paperclip, X } from "lucide-react";
import { cn } from "@/lib/cn";

// --- Dictée vocale (API Web Speech du navigateur) ---------------------------
// Types minimaux : l'API n'est pas dans toutes les versions de lib.dom.
type ResultatDictee = { isFinal: boolean; 0: { transcript: string } };
type Reconnaissance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ResultatDictee> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type ConstructeurReconnaissance = new () => Reconnaissance;

function constructeurDictee(): ConstructeurReconnaissance | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: ConstructeurReconnaissance;
    webkitSpeechRecognition?: ConstructeurReconnaissance;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const pasDAbonnement = () => () => {};

export type Raccourci = { libelle: string; texte: string };

type Props = {
  value: string;
  onChange: (valeur: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  /** Exemples qui défilent dans la zone vide. */
  exemples: string[];
  /** Pastilles affichées quand la zone est dépliée ; elles pré-remplissent la demande. */
  raccourcis?: Raccourci[];
  /** Absent = pas de bouton « joindre une image » (ex. palette, typographie). */
  onJoindre?: (fichier: File) => void;
  envoiPieceJointe?: boolean;
  pieceJointe?: { url: string; nom: string } | null;
  onRetirerPieceJointe?: () => void;
  /**
   * Autorise l'envoi avec une zone vide (ex. visuels marketing : la
   * description est optionnelle, l'identité de l'entreprise suffit).
   */
  autoriserVide?: boolean;
  /** Placeholder une fois la zone dépliée (par défaut « Votre demande… »). */
  placeholder?: string;
};

/**
 * Zone de saisie du chat IA (inspirée d'AIChatInput de HextaUI) : barre
 * arrondie qui se déplie au focus, exemples animés lettre par lettre,
 * pièce jointe, dictée vocale et raccourcis de demandes.
 */
export default function ChatComposer({
  value,
  onChange,
  onSubmit,
  disabled,
  exemples,
  raccourcis = [],
  onJoindre,
  envoiPieceJointe,
  pieceJointe,
  onRetirerPieceJointe,
  autoriserVide = false,
  placeholder = "Votre demande…",
}: Props) {
  const reduceMotion = useReducedMotion();
  // Peut-on envoyer ? Texte non vide, sauf si l'appelant accepte le vide.
  const envoyable = (autoriserVide || Boolean(value.trim())) && !disabled;
  const [actif, setActif] = useState(false);
  const [indexExemple, setIndexExemple] = useState(0);
  const [afficherExemple, setAfficherExemple] = useState(true);
  const [ecoute, setEcoute] = useState(false);
  const conteneurRef = useRef<HTMLDivElement>(null);
  const saisieRef = useRef<HTMLTextAreaElement>(null);
  const reconnaissanceRef = useRef<Reconnaissance | null>(null);

  // Côté serveur : pas de dictée (évite un écart de rendu à l'hydratation).
  const dicteeDisponible = useSyncExternalStore(
    pasDAbonnement,
    () => constructeurDictee() !== null,
    () => false
  );

  const deplie = actif || Boolean(value) || Boolean(pieceJointe);

  // Fait défiler les exemples tant que la zone est vide et inactive.
  useEffect(() => {
    if (actif || value || exemples.length < 2) return;
    let timeout: ReturnType<typeof setTimeout>;
    const intervalle = setInterval(() => {
      setAfficherExemple(false);
      timeout = setTimeout(() => {
        setIndexExemple((i) => (i + 1) % exemples.length);
        setAfficherExemple(true);
      }, 400);
    }, 3500);
    return () => {
      clearInterval(intervalle);
      clearTimeout(timeout);
    };
  }, [actif, value, exemples.length]);

  // Replie la zone au clic en dehors, si elle est vide.
  useEffect(() => {
    const auClic = (e: MouseEvent) => {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node) && !value) {
        setActif(false);
      }
    };
    document.addEventListener("mousedown", auClic);
    return () => document.removeEventListener("mousedown", auClic);
  }, [value]);

  // Arrête la dictée si le composant disparaît.
  useEffect(() => () => reconnaissanceRef.current?.stop(), []);

  const basculerDictee = () => {
    if (ecoute) {
      reconnaissanceRef.current?.stop();
      return;
    }
    const Constructeur = constructeurDictee();
    if (!Constructeur) return;

    const reconnaissance = new Constructeur();
    reconnaissance.lang = "fr-FR";
    reconnaissance.continuous = true;
    reconnaissance.interimResults = false;
    const base = value ? `${value.trimEnd()} ` : "";
    let dicte = "";
    reconnaissance.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) dicte += e.results[i][0].transcript;
      }
      onChange(base + dicte.trim());
    };
    reconnaissance.onend = () => setEcoute(false);
    reconnaissance.onerror = () => setEcoute(false);
    reconnaissanceRef.current = reconnaissance;
    reconnaissance.start();
    setEcoute(true);
    setActif(true);
  };

  const utiliserRaccourci = (texte: string) => {
    onChange(texte);
    requestAnimationFrame(() => {
      const el = saisieRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(texte.length, texte.length);
    });
  };

  const exemple = exemples[indexExemple] ?? "";

  return (
    <motion.div
      ref={conteneurRef}
      onClick={() => {
        if (disabled) return;
        setActif(true);
        saisieRef.current?.focus();
      }}
      animate={{
        boxShadow: deplie
          ? "0 12px 36px -12px rgba(70,72,212,0.35), 0 0 0 1.5px rgba(70,72,212,0.35)"
          : "0 2px 10px -2px rgba(27,27,35,0.10), 0 0 0 1px rgba(199,196,215,0.8)",
      }}
      transition={{ type: "spring", stiffness: 160, damping: 20 }}
      className={cn(
        "w-full overflow-hidden rounded-[28px] bg-surface-container-lowest",
        disabled && "opacity-70"
      )}
    >
      {pieceJointe && (
        <div className="mx-3 mt-3 flex items-center gap-2 rounded-2xl bg-primary/5 px-2.5 py-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={pieceJointe.url} alt="" className="h-8 w-8 rounded-lg object-cover" />
          <span className="flex-1 truncate text-[13px] text-on-surface">{pieceJointe.nom}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRetirerPieceJointe?.();
            }}
            aria-label="Retirer l'image jointe"
            className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-error/10 hover:text-error"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Ligne de saisie */}
      <div className="flex items-end gap-1.5 p-2.5">
        {onJoindre && (
        <label
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors",
            envoiPieceJointe || disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-primary/10 hover:text-primary"
          )}
          title="Joindre une image"
          onClick={(e) => e.stopPropagation()}
        >
          <Paperclip className={cn("h-5 w-5", envoiPieceJointe && "animate-pulse")} aria-hidden="true" />
          <span className="sr-only">Joindre une image</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={envoiPieceJointe || disabled}
            onChange={(e) => {
              const fichier = e.target.files?.[0];
              if (fichier) onJoindre(fichier);
              e.target.value = "";
            }}
          />
        </label>
        )}

        <div className={cn("relative min-w-0 flex-1 self-center", !onJoindre && "pl-2")}>
          <textarea
            ref={saisieRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setActif(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (envoyable) onSubmit();
              }
            }}
            rows={1}
            disabled={disabled}
            aria-label="Votre message à l'assistant"
            placeholder={deplie ? placeholder : undefined}
            className="relative z-10 max-h-40 min-h-10 w-full resize-none border-0 bg-transparent px-1 py-2.5 text-[15px] leading-6 text-on-surface placeholder:text-outline focus:outline-none focus:ring-0 focus-visible:outline-none [field-sizing:content]"
          />

          {/* Exemples animés lettre par lettre (zone vide et repliée). */}
          <div className="pointer-events-none absolute inset-0 flex items-center px-1" aria-hidden="true">
            <AnimatePresence mode="wait">
              {afficherExemple && !deplie && exemple && (
                <motion.span
                  key={indexExemple}
                  className="truncate whitespace-nowrap text-[15px] text-outline"
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={{
                    initial: {},
                    animate: { transition: { staggerChildren: reduceMotion ? 0 : 0.018 } },
                    exit: { transition: { staggerChildren: reduceMotion ? 0 : 0.01, staggerDirection: -1 } },
                  }}
                >
                  {exemple.split("").map((lettre, i) => (
                    <motion.span
                      key={i}
                      className="inline-block"
                      variants={{
                        initial: { opacity: 0, filter: "blur(10px)", y: 8 },
                        animate: {
                          opacity: 1,
                          filter: "blur(0px)",
                          y: 0,
                          transition: { opacity: { duration: 0.25 }, filter: { duration: 0.35 }, y: { type: "spring", stiffness: 90, damping: 20 } },
                        },
                        exit: {
                          opacity: 0,
                          filter: "blur(10px)",
                          y: -8,
                          transition: { opacity: { duration: 0.18 }, filter: { duration: 0.25 } },
                        },
                      }}
                    >
                      {lettre === " " ? " " : lettre}
                    </motion.span>
                  ))}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {dicteeDisponible && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              basculerDictee();
            }}
            disabled={disabled}
            aria-pressed={ecoute}
            title={ecoute ? "Arrêter la dictée" : "Dicter au micro"}
            className={cn(
              "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50",
              ecoute ? "bg-error/10 text-error" : "text-on-surface-variant hover:bg-primary/10 hover:text-primary"
            )}
          >
            {ecoute && <span className="absolute inset-1 animate-ping rounded-full bg-error/20" aria-hidden="true" />}
            <Mic className="relative h-5 w-5" aria-hidden="true" />
            <span className="sr-only">{ecoute ? "Arrêter la dictée" : "Dicter au micro"}</span>
          </button>
        )}

        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (envoyable) onSubmit();
          }}
          disabled={!envoyable}
          whileHover={envoyable ? { scale: 1.06 } : undefined}
          whileTap={envoyable ? { scale: 0.92 } : undefined}
          title="Envoyer"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary shadow-[0_8px_18px_-8px_rgba(70,72,212,0.8)] transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-surface-container-high disabled:text-outline disabled:shadow-none"
        >
          <ArrowUp className="h-5 w-5" aria-hidden="true" />
          <span className="sr-only">Envoyer</span>
        </motion.button>
      </div>

      {/* Raccourcis, visibles quand la zone est dépliée */}
      <AnimatePresence initial={false}>
        {deplie && raccourcis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto", transition: { duration: 0.3, delay: 0.05 } }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
          >
            <div className="flex flex-wrap gap-2 px-4 pb-3.5">
              {raccourcis.map((r, i) => (
                <motion.button
                  key={r.libelle}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.08 + i * 0.04 } }}
                  onClick={(e) => {
                    e.stopPropagation();
                    utiliserRaccourci(r.texte);
                  }}
                  disabled={disabled}
                  className="rounded-full bg-surface-container px-3.5 py-1.5 text-[13px] font-medium text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {r.libelle}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
