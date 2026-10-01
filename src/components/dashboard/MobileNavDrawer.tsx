"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "@phosphor-icons/react";

import EntrepriseSwitcher from "./EntrepriseSwitcher";
import SidebarContent from "./SidebarContent";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  /** Bouton « Menu » de TopNav.tsx : le focus y revient à la fermeture. */
  retourFocusRef: React.RefObject<HTMLButtonElement | null>;
};

// Même ressort que les autres panneaux du dashboard, un peu plus amorti pour
// qu'un panneau de 288 px ne rebondisse pas.
const RESSORT = { type: "spring", stiffness: 380, damping: 40 } as const;

/**
 * Tiroir de navigation sous lg (la Sidebar bureau est masquée). Il monte le
 * même SidebarContent que la Sidebar : mêmes items (nav-items.ts), même
 * sélecteur d'entreprise, même encart Pro, même déconnexion.
 *
 * Fermeture : croix, clic sur le voile, Échap, ou clic sur un lien.
 */
export default function MobileNavDrawer({ open, onClose, retourFocusRef }: MobileNavDrawerProps) {
  const panneauRef = useRef<HTMLDivElement>(null);
  const titreId = useId();
  const reduireMouvement = useReducedMotion();

  // Rendu dans document.body (portail) : le <header> de TopNav a un
  // backdrop-blur, qui ferait du tiroir `fixed` un enfant positionné par
  // rapport à la barre et non à l'écran. `monte` vaut false au rendu serveur
  // et pendant l'hydratation, true ensuite (sans setState dans un effet).
  const monte = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Échap, blocage du défilement du fond et focus dans le tiroir à
  // l'ouverture ; retour du focus sur le bouton « Menu » à la fermeture.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const overflowInitial = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const bouton = retourFocusRef.current;
    const premierFocusable = panneauRef.current?.querySelector<HTMLElement>(
      "button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])"
    );
    premierFocusable?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflowInitial;
      bouton?.focus();
    };
  }, [open, onClose, retourFocusRef]);

  // Garde le focus clavier dans le tiroir (Tab en boucle).
  const onKeyDownPanneau = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panneauRef.current) return;
    const focusables = Array.from(
      panneauRef.current.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href], input, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((el) => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const premier = focusables[0];
    const dernier = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === premier) {
      e.preventDefault();
      dernier.focus();
    } else if (!e.shiftKey && document.activeElement === dernier) {
      e.preventDefault();
      premier.focus();
    }
  };

  if (!monte) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Voile */}
          <motion.button
            type="button"
            aria-label="Fermer le menu"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduireMouvement ? 0 : 0.2 }}
            className="absolute inset-0 cursor-default bg-on-surface/40 backdrop-blur-[2px]"
          />

          {/* Panneau */}
          <motion.div
            ref={panneauRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titreId}
            onKeyDown={onKeyDownPanneau}
            initial={reduireMouvement ? { opacity: 0 } : { x: "-100%" }}
            animate={reduireMouvement ? { opacity: 1 } : { x: 0 }}
            exit={reduireMouvement ? { opacity: 0 } : { x: "-100%" }}
            transition={reduireMouvement ? { duration: 0.15 } : RESSORT}
            className="absolute inset-y-0 left-0 flex w-[min(18rem,calc(100vw-3rem))] flex-col border-r border-outline-variant bg-surface-container-low shadow-[0_24px_60px_-20px_rgba(27,27,35,0.45)]"
          >
            <h2 id={titreId} className="sr-only">
              Menu de navigation
            </h2>

            <div className="flex h-full flex-col px-md py-lg">
              {/* En-tête : sélecteur d'entreprise + fermeture */}
              <div className="flex items-center justify-between gap-2 px-0.5 pb-6">
                <EntrepriseSwitcher collapsed={false} />

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fermer le menu"
                  className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                >
                  <X size={20} weight="bold" aria-hidden="true" />
                </button>
              </div>

              <SidebarContent collapsed={false} layoutGroupId="tiroir-mobile" onNavigate={onClose} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
