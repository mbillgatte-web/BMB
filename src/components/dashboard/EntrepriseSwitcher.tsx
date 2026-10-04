"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { cn } from "@/lib/cn";
import { useEntreprise } from "@/hooks/useEntreprise";
import { libelleSecteur, type Entreprise } from "@/data/entreprise";

function Avatar({ entreprise, size }: { entreprise: Entreprise | null; size: "md" | "sm" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center bg-primary font-extrabold text-on-primary",
        size === "md"
          ? "h-[42px] w-[42px] rounded-xl text-[15px] shadow-[0_8px_18px_-8px_rgba(15,122,56,0.55)]"
          : "h-8 w-8 rounded-lg text-[13px]"
      )}
      aria-hidden="true"
    >
      {(entreprise?.nom ?? "B").charAt(0).toUpperCase()}
    </div>
  );
}

/**
 * En-tête de la Sidebar : affiche l'entreprise active et permet d'en changer
 * ou d'en créer une nouvelle. La sélection est partagée avec tout le
 * dashboard via useEntreprise().
 */
export default function EntrepriseSwitcher({ collapsed }: { collapsed: boolean }) {
  const { entreprise, entreprises, selectEntreprise, loading } = useEntreprise();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Fermeture au clic en dehors et à la touche Échap.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const sousTitre = loading
    ? "Chargement…"
    : (libelleSecteur(entreprise?.secteur_activite ?? null) ?? "Strategic Suite");

  return (
    <div ref={rootRef} className={cn("relative", collapsed ? "" : "min-w-0 flex-1")}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Entreprise active : ${entreprise?.nom ?? "aucune"}. Changer d'entreprise`}
        title={collapsed ? (entreprise?.nom ?? "Build My Business") : undefined}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border text-left transition-colors",
          collapsed ? "justify-center border-transparent p-0" : "p-1.5 pr-2.5",
          open
            ? "border-outline-variant bg-surface-container"
            : "border-transparent hover:bg-surface-container"
        )}
      >
        <Avatar entreprise={entreprise} size="md" />
        {!collapsed && (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-bold leading-tight text-on-surface">
                {loading ? (
                  <span className="block h-4 w-28 animate-pulse rounded bg-surface-container-high" />
                ) : (
                  (entreprise?.nom ?? "Build My Business")
                )}
              </p>
              <p className="mt-1 truncate text-[12px] leading-none text-on-surface-variant/70">
                {sousTitre}
              </p>
            </div>
            <ChevronsUpDown
              className="h-4 w-4 shrink-0 text-on-surface-variant/70"
              aria-hidden="true"
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className={cn(
              "absolute z-50 w-72 overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container-lowest shadow-[0_24px_48px_-16px_rgba(20,20,60,0.28)]",
              collapsed ? "left-full top-0 ml-3 origin-top-left" : "left-0 top-full mt-2 origin-top"
            )}
          >
            <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                Vos entreprises
              </span>
              <span className="rounded-full bg-surface-container px-2 py-0.5 text-[11px] font-semibold text-on-surface-variant">
                {entreprises.length}
              </span>
            </div>

            {entreprises.length > 0 ? (
              <ul role="listbox" aria-label="Vos entreprises" className="max-h-72 overflow-y-auto px-1.5 pb-1.5">
                {entreprises.map((e) => {
                  const isActive = e.id === entreprise?.id;
                  return (
                    <li key={e.id}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          selectEntreprise(e.id);
                          setOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors",
                          isActive ? "bg-primary/[0.08]" : "hover:bg-surface-container"
                        )}
                      >
                        <Avatar entreprise={e} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p
                            className={cn(
                              "truncate text-[14px] leading-tight",
                              isActive ? "font-semibold text-primary" : "font-medium text-on-surface"
                            )}
                          >
                            {e.nom}
                          </p>
                          {e.secteur_activite && (
                            <p className="mt-0.5 truncate text-[12px] leading-tight text-on-surface-variant/70">
                              {libelleSecteur(e.secteur_activite)}
                            </p>
                          )}
                        </div>
                        {isActive && (
                          <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.4} aria-hidden="true" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="px-4 pb-3 text-[13px] text-on-surface-variant">
                {loading ? "Chargement…" : "Aucune entreprise pour le moment."}
              </p>
            )}

            <div className="border-t border-outline-variant/50 p-1.5">
              <Link
                href="/BuildEntreprise"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-2.5 py-2 text-[14px] font-medium text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-outline-variant">
                  <Plus className="h-4 w-4" aria-hidden="true" />
                </span>
                Nouvelle entreprise
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
