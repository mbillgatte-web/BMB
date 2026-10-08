"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { List } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import { useEntreprise } from "@/hooks/useEntreprise";
import { findNavLabel } from "./nav-items";
import MobileNavDrawer from "./MobileNavDrawer";

export default function TopNav() {
  const pathname = usePathname();
  const { entreprise } = useEntreprise();
  const pageLabel = findNavLabel(pathname) ?? "Dashboard";

  // Tiroir de navigation sous lg (voir MobileNavDrawer.tsx) : la Sidebar
  // bureau est masquée à ces largeurs.
  const [menuOuvert, setMenuOuvert] = useState(false);
  const boutonMenuRef = useRef<HTMLButtonElement>(null);
  const fermerMenu = useCallback(() => setMenuOuvert(false), []);

  return (
    <header className="top-0 z-40 h-16 flex-shrink-0 border-b border-outline-variant/70 bg-surface/95 shadow-[0_4px_16px_rgba(27,27,35,0.04)] backdrop-blur-md">
      <div className="flex justify-between items-center w-full gap-2 px-4 sm:px-gutter max-w-container-max mx-auto h-full">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            ref={boutonMenuRef}
            type="button"
            onClick={() => setMenuOuvert(true)}
            aria-label="Ouvrir le menu"
            aria-haspopup="dialog"
            aria-expanded={menuOuvert}
            className="-ml-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-surface transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 lg:hidden"
          >
            <List size={24} weight="bold" aria-hidden="true" />
          </button>

          {/* Fil d'ariane : entreprise sélectionnée -> page actuelle (voir
              nav-items.ts pour la correspondance pathname -> libellé, partagée
              avec la Sidebar). Sous sm, seule la page actuelle reste visible. */}
          <div className="flex min-w-0 items-center gap-2 font-body-sm text-body-sm">
            <span className="hidden truncate max-w-[160px] font-semibold text-on-surface sm:inline">
              {entreprise?.nom ?? "Build My Business"}
            </span>
            <span className="hidden text-outline sm:inline">/</span>
            <span className="truncate text-on-surface-variant">{pageLabel}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center">
          <Button variant="icon" aria-label="Notifications">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error" />
          </Button>
        </div>
      </div>

      <MobileNavDrawer open={menuOuvert} onClose={fermerMenu} retourFocusRef={boutonMenuRef} />
    </header>
  );
}
