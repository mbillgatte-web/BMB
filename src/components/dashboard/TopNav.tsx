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

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2 sm:gap-4">
          <div className="relative hidden md:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-full text-body-sm font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
            />
          </div>

          {/* Enveloppe plutôt que `hidden md:inline-flex` sur le Button : son
              `inline-flex` interne écrasait `hidden` (cn ne résout pas les
              conflits) et le bouton restait visible sur mobile. */}
          <div className="hidden md:block">
            <Button variant="secondary" size="sm">
              <span className="material-symbols-outlined text-[18px]">magic_button</span>
              Demander à l&apos;IA
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="icon" aria-label="Notifications">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error" />
            </Button>
            <Button
              variant="icon"
              size="sm"
              aria-label="Menu du compte"
              className="overflow-hidden border-2 border-surface-container-highest hover:border-primary"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkaIG7VR9HQJOfxHlB7tjV4SfJP8LCnaZkFDK37lgrTPyGrf8gecG6K1F0Z-9YfOFwuBNn_9cGWYimeU4Z-CuCN4cG4L7eWAexEyyjigGIH6BrfX5GqVmPEeBA98e-X3RWHQ2uYkkq9rbSbM4tEBFmyJFI26Bhc3fBpfccCI9RA65G9GDRVsqS-V89IyjJQqgNcBiXMs5ePx0wa-hsID61W_9a2viEoZzS0RLuSUNHClRClQl1oKXF0Q"
                alt="Avatar utilisateur"
                className="h-full w-full object-cover"
              />
            </Button>
          </div>
        </div>
      </div>

      <MobileNavDrawer open={menuOuvert} onClose={fermerMenu} retourFocusRef={boutonMenuRef} />
    </header>
  );
}
