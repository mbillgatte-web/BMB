"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";
import BrandMark from "@/components/ui/BrandMark";
import { cn } from "@/lib/cn";

/**
 * Coque partagée par Connexion (/) et Inscription (/Inscription), montée par
 * src/app/(auth)/layout.tsx. Comme ce layout reste en place quand on passe
 * d'une page à l'autre, les deux panneaux peuvent échanger leur place avec
 * une animation : formulaire à gauche pour la connexion, à droite pour
 * l'inscription.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname !== "/Inscription";
  const reduceMotion = useReducedMotion();
  const echange = reduceMotion
    ? { duration: 0 }
    : ({ type: "spring", stiffness: 200, damping: 25 } as const);

  return (
    <LayoutGroup>
      <div className="flex min-h-dvh bg-surface-container-lowest">
        {/* Panneau formulaire */}
        <motion.div
          layout
          transition={echange}
          className={cn(
            "flex w-full flex-col px-5 py-6 sm:px-10 lg:w-1/2 xl:px-16",
            isLogin ? "lg:order-1" : "lg:order-2"
          )}
        >
          <header>
            <BrandMark href="/" />
          </header>

          <main className="flex flex-1 flex-col items-center justify-center py-10">
            {/* La clé rejoue l'entrée en cascade du formulaire à chaque bascule. */}
            <div key={pathname} className="w-full max-w-[400px]">
              {children}

              <p className="stagger-in mt-8 text-center text-sm text-on-surface-variant">
                <span>
                  {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
                  <Link
                    href={isLogin ? "/Inscription" : "/"}
                    className="font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline"
                  >
                    {isLogin ? "Créer un compte" : "Se connecter"}
                  </Link>
                </span>
              </p>
            </div>
          </main>

          <footer className="text-center text-xs text-outline">
            © {new Date().getFullYear()} Build My Business
          </footer>
        </motion.div>

        {/* Panneau de présentation */}
        <motion.aside
          layout
          transition={echange}
          className={cn(
            "sticky top-0 hidden h-dvh w-1/2 lg:block",
            isLogin ? "lg:order-2" : "lg:order-1"
          )}
        >
          <AuthPresentation />
        </motion.aside>
      </div>
    </LayoutGroup>
  );
}

// Grain très fin (bruit SVG) posé sur le fond : donne une texture de papier
// imprimé plutôt qu'un aplat numérique.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function AuthPresentation() {
  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden px-12 xl:px-16"
      style={{
        // Profondeur dans les tons de la marque uniquement (pas de dégradé
        // multicolore) : lumière en haut à gauche, ombre en bas à droite.
        background:
          "radial-gradient(90% 70% at 10% 0%, #6367EC 0%, transparent 60%), " +
          "radial-gradient(80% 70% at 100% 100%, #2B2DA0 0%, transparent 65%), " +
          "#4648D4",
      }}
    >
      {/* Motif géométrique en losanges, inspiré des tissus africains ; il
          s'estompe vers le centre pour laisser le texte respirer. */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_85%)]"
      >
        <defs>
          <pattern id="auth-motif" width="64" height="64" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="white" strokeOpacity="0.12" strokeWidth="1">
              <path d="M32 4 L60 32 L32 60 L4 32 Z" />
              <path d="M32 18 L46 32 L32 46 L18 32 Z" />
              <path d="M0 0 L8 8 M64 0 L56 8 M0 64 L8 56 M64 64 L56 56" />
            </g>
            <circle cx="32" cy="32" r="2" fill="white" fillOpacity="0.18" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-motif)" />
      </svg>

      {/* Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative flex w-full max-w-[500px] flex-col items-center text-center text-white">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          <span className="h-px w-6 bg-white/40" aria-hidden="true" />
          Build My Business
          <span className="h-px w-6 bg-white/40" aria-hidden="true" />
        </p>

        <h2 className="mt-6 text-[40px] font-semibold leading-[1.1] tracking-[-0.03em]">
          Votre idée. Notre plateforme. Votre succès.
        </h2>
        <figure className="mt-10 w-full border-t border-white/15 pt-8">
          <Quote className="mx-auto h-6 w-6 text-white/40" aria-hidden="true" />
          <blockquote className="mt-3 text-lg font-medium leading-snug text-white/95">
            Chaque grande entreprise commence par une idée. La différence se joue dans l&apos;exécution.
          </blockquote>
          <figcaption className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-white/55">
            Vision to Reality
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
