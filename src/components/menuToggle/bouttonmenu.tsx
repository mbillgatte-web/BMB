"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

type MenuToggleProps = Omit<ComponentProps<"button">, "onClick"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Classes appliquées au <svg> lui-même (taille, etc.) plutôt qu'au bouton. */
  iconClassName?: string;
};

/**
 * Icône de bascule "hamburger <-> X" animée (morphing SVG), utilisée pour
 * ouvrir/fermer la Sidebar (voir Sidebar.tsx). Composant entièrement
 * contrôlé par `open` -- pas d'état interne, le parent décide.
 *
 * Un vrai <button> (pas de <label><input type="checkbox" className="hidden">
 * comme dans la version d'origine) : un input en display:none sort
 * entièrement du parcours clavier (plus de tabulation/Entrée possible),
 * alors que le bouton qu'il remplace dans la Sidebar l'était.
 */
export function MenuToggle({
  open,
  onOpenChange,
  className,
  iconClassName,
  ...props
}: MenuToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onOpenChange(!open)}
      aria-pressed={open}
      className={cn("flex cursor-pointer items-center justify-center", className)}
      {...props}
    >
      <svg
        strokeWidth={2}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 32 32"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={cn(
          "size-5 transition-transform duration-600 ease-out",
          open && "-rotate-45",
          iconClassName
        )}
      >
        <path
          className={cn(
            "transition-all duration-600 ease-out",
            open
              ? "[stroke-dasharray:20_300] [stroke-dashoffset:-32.42px]"
              : "[stroke-dasharray:12_63]"
          )}
          d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
        />
        <path d="M7 16 27 16" />
      </svg>
    </button>
  );
}
