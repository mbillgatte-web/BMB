"use client";

import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "icon";
export type ButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Flèches animées. Actives par défaut sur `primary` uniquement. */
  arrows?: boolean;
  /** Remplace les flèches par un spinner et neutralise les interactions. */
  loading?: boolean;
  children?: ReactNode;
  className?: string;
};

type ButtonAsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof BaseProps> & { href?: undefined };

type ButtonAsLink = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof BaseProps> & { href: string };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

/**
 * Socle commun aux variantes « pilule » (primary/secondary) : morphing des
 * coins 100px → 12px, overflow masqué pour clipper le cercle, et l'easing
 * d'origine du bouton de référence.
 */
const SHELL =
  "group relative inline-flex items-center justify-center gap-1 overflow-hidden " +
  "cursor-pointer select-none font-semibold leading-none whitespace-nowrap " +
  "rounded-[100px] hover:rounded-[12px] " +
  "transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] " +
  "active:scale-[0.95] focus-visible:outline-none focus-visible:ring-4 " +
  "focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: `${SHELL} border-[1.5px] border-primary/40 bg-transparent text-primary hover:border-transparent hover:text-white`,
  secondary: `${SHELL} border-[1.5px] border-outline-variant bg-transparent text-on-surface hover:border-transparent hover:text-white`,
  ghost:
    "group relative inline-flex cursor-pointer select-none items-center gap-2 " +
    "font-semibold leading-none whitespace-nowrap rounded-[100px] hover:rounded-[12px] " +
    "text-on-surface-variant transition-all duration-[600ms] " +
    "ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/10 hover:text-primary " +
    "active:scale-[0.95] focus-visible:outline-none focus-visible:ring-4 " +
    "focus-visible:ring-primary/25 disabled:pointer-events-none disabled:opacity-50",
  icon:
    "group relative inline-flex shrink-0 cursor-pointer items-center justify-center " +
    "rounded-full text-on-surface-variant transition-all duration-300 " +
    "hover:bg-primary/10 hover:text-primary active:scale-[0.95] " +
    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 " +
    "disabled:pointer-events-none disabled:opacity-50",
};

const SHELL_SIZES: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-xs",
  md: "px-8 py-3 text-sm",
  lg: "px-10 py-3.5 text-sm",
};

const GHOST_SIZES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

const ICON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-9 w-9",
  lg: "h-10 w-10",
};

/**
 * Classes des flèches, écrites en toutes lettres : Tailwind scanne le source
 * statiquement, une interpolation type `left-${n}` ne serait jamais générée.
 */
const ARROWS: Record<ButtonSize, { left: string; right: string; text: string }> = {
  sm: {
    left: "left-[-25%] group-hover:left-3",
    right: "right-3 group-hover:right-[-25%]",
    text: "-translate-x-2.5 group-hover:translate-x-2.5",
  },
  md: {
    left: "left-[-25%] group-hover:left-4",
    right: "right-4 group-hover:right-[-25%]",
    text: "-translate-x-3 group-hover:translate-x-3",
  },
  lg: {
    left: "left-[-25%] group-hover:left-5",
    right: "right-5 group-hover:right-[-25%]",
    text: "-translate-x-3.5 group-hover:translate-x-3.5",
  },
};

const ARROW_MOTION =
  "pointer-events-none absolute z-10 h-4 w-4 fill-none transition-all " +
  "duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] " +
  "stroke-current group-hover:stroke-white";

/**
 * Le cercle est dimensionné en pourcentage de la largeur du bouton (et non en
 * 220px fixes) pour couvrir aussi bien un bouton pleine largeur qu'une petite
 * pilule, et il s'anime en `scale` plutôt qu'en `width`/`height` pour rester
 * sur le compositeur.
 */
const CIRCLE =
  "pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[130%] " +
  "-translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-primary opacity-0 " +
  "transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] " +
  "group-hover:scale-100 group-hover:opacity-100";

export default function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    arrows,
    loading = false,
    children,
    className,
    ...rest
  } = props;

  const isShell = variant === "primary" || variant === "secondary";
  const showArrows = (arrows ?? variant === "primary") && isShell && !loading;
  const arrow = ARROWS[size];

  const sizing =
    variant === "icon"
      ? ICON_SIZES[size]
      : variant === "ghost"
        ? GHOST_SIZES[size]
        : SHELL_SIZES[size];

  const content = (
    <>
      {showArrows && <ArrowRight aria-hidden className={cn(ARROW_MOTION, arrow.left)} />}

      {isShell && <span aria-hidden className={CIRCLE} />}

      <span
        className={cn(
          "relative z-10 inline-flex items-center gap-2 transition-all duration-[800ms] ease-out",
          showArrows && arrow.text,
        )}
      >
        {loading && <Loader2 aria-hidden className="h-4 w-4 animate-spin" />}
        {children}
      </span>

      {showArrows && <ArrowRight aria-hidden className={cn(ARROW_MOTION, arrow.right)} />}
    </>
  );

  const classes = cn(VARIANTS[variant], sizing, className);

  if (props.href !== undefined) {
    const { href, ...linkRest } = rest as ComponentPropsWithoutRef<typeof Link>;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {content}
      </Link>
    );
  }

  const { type = "button", disabled, ...buttonRest } =
    rest as ComponentPropsWithoutRef<"button">;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...buttonRest}
    >
      {content}
    </button>
  );
}
