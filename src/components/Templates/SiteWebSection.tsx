"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutTemplate, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import TemplateGallery from "./TemplateGallery";
import SiteChatBuilder from "./SiteChatBuilder";

type Mode = "modeles" | "ia";

const MODES: { valeur: Mode; libelle: string; icone: LucideIcon }[] = [
  { valeur: "modeles", libelle: "Partir d'un modèle", icone: LayoutTemplate },
  { valeur: "ia", libelle: "Créer avec l'IA", icone: Sparkles },
];

/**
 * Section « Mon site web » : deux façons de créer son site, au choix —
 * partir d'un template (TemplateGallery) ou le décrire à l'IA dans une
 * fenêtre de chat (SiteChatBuilder).
 */
export default function SiteWebSection() {
  const [mode, setMode] = useState<Mode>("modeles");

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Mon site web</h1>
          <p className="mt-1 text-[15px] leading-6 text-on-surface">
            {mode === "modeles"
              ? "Choisissez un modèle, puis adaptez-le à votre activité."
              : "Décrivez le site que vous voulez : l'IA le construit avec votre identité visuelle."}
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Façon de créer le site"
          className="flex w-fit shrink-0 rounded-xl border border-outline-variant bg-surface-container-lowest p-1 shadow-sm"
        >
          {MODES.map(({ valeur, libelle, icone: Icone }) => {
            const actif = mode === valeur;
            return (
              <button
                key={valeur}
                type="button"
                role="tab"
                aria-selected={actif}
                onClick={() => setMode(valeur)}
                className={cn(
                  "relative flex min-h-9 items-center gap-2 rounded-lg px-4 py-2 text-[14px] font-semibold transition-colors duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                  actif ? "text-on-primary" : "text-on-surface hover:text-primary"
                )}
              >
                {actif && (
                  <motion.span
                    layoutId="mode-site"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-lg bg-primary shadow-[0_8px_16px_-10px_rgba(70,72,212,0.7)]"
                  />
                )}
                <Icone className="relative z-10 h-4 w-4" aria-hidden="true" />
                <span className="relative z-10">{libelle}</span>
              </button>
            );
          })}
        </div>
      </div>

      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {mode === "modeles" ? <TemplateGallery /> : <SiteChatBuilder />}
      </motion.div>
    </div>
  );
}
