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
      <div className="flex min-h-dvh bg-[#F6F4EF]">
        {/* Panneau formulaire : papier chaud tramé, carte blanche posée dessus */}
        <motion.div
          layout
          transition={echange}
          className={cn(
            "relative isolate flex w-full flex-col overflow-hidden px-4 py-5 sm:px-10 sm:py-6 lg:w-1/2 xl:px-16",
            isLogin ? "lg:order-1" : "lg:order-2"
          )}
        >
          <FondPapier />

          <header>
            <BrandMark href="/" />
          </header>

          <main className="flex flex-1 flex-col items-center justify-center py-8 sm:py-10">
            {/* La clé rejoue l'entrée en cascade du formulaire à chaque bascule. */}
            <div key={pathname} className="w-full max-w-[440px]">
              <div className="animate-rise-in rounded-[24px] border border-black/[0.07] bg-white px-5 py-7 shadow-[0_1px_2px_rgba(24,24,27,0.05),0_16px_40px_-12px_rgba(24,24,27,0.14)] sm:px-10 sm:py-10">
                {children}
              </div>

              <p className="cascade-floue mt-6 text-center text-sm text-on-surface-variant [--cascade-depart:420ms]">
                <span>
                  {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
                  <Link
                    href={isLogin ? "/Inscription" : "/"}
                    className="inline-flex min-h-11 items-center font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline"
                  >
                    {isLogin ? "Créer un compte" : "Se connecter"}
                  </Link>
                </span>
              </p>
            </div>
          </main>

          <footer className="text-center text-xs text-on-surface-variant">
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

/**
 * Fond du côté formulaire : trame de points verts avec, tous les deux
 * points, un petit losange qui rappelle le motif du panneau vert. La trame
 * s'efface autour de la carte et un grain léger casse l'aplat.
 */
function FondPapier() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <svg className="absolute inset-0 h-full w-full [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,transparent_20%,black_75%)]">
        <defs>
          <pattern id="auth-trame" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="0" cy="0" r="1.3" fill="#0F7A38" fillOpacity="0.28" />
            <circle cx="48" cy="0" r="1.3" fill="#0F7A38" fillOpacity="0.28" />
            <circle cx="0" cy="48" r="1.3" fill="#0F7A38" fillOpacity="0.28" />
            <circle cx="48" cy="48" r="1.3" fill="#0F7A38" fillOpacity="0.28" />
            <path d="M24 18 L30 24 L24 30 L18 24 Z" fill="none" stroke="#0F7A38" strokeOpacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-trame)" />
      </svg>
      <div
        className="absolute inset-0 opacity-[0.35] mix-blend-multiply"
        style={{ backgroundImage: GRAIN_SOMBRE }}
      />
    </div>
  );
}

// Grain très fin (bruit SVG) posé sur le fond : donne une texture de papier
// imprimé plutôt qu'un aplat numérique.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

// Même bruit, en sombre et très transparent, pour le papier clair.
const GRAIN_SOMBRE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.1 0 0 0 0 0.1 0 0 0 0 0.2 0 0 0 0.12 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

function AuthPresentation() {
  return (
    <div
      className="relative flex h-full items-center justify-center overflow-hidden px-12 xl:px-16"
      style={{
        // Profondeur dans les tons de la marque uniquement (pas de dégradé
        // multicolore) : lumière en haut à gauche, ombre en bas à droite.
        background:
          "radial-gradient(90% 70% at 10% 0%, #2E9E5B 0%, transparent 60%), " +
          "radial-gradient(80% 70% at 100% 100%, #0B5F2B 0%, transparent 65%), " +
          "#0F7A38",
      }}
    >
      {/* Panneau volontairement épuré : profondeur de couleur et grain
          seulement, sans motif (demande de l'utilisateur, les losanges et
          frises chargeaient trop la page). */}

      {/* Grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative flex w-full max-w-[500px] flex-col items-center text-center text-white">
        <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          <span className="h-px w-6 bg-white/40" aria-hidden="true" />
          Build My Business
          <span className="h-px w-6 bg-white/40" aria-hidden="true" />
        </p>

        <h2 className="mt-6 text-[44px] font-semibold leading-[1.05] tracking-[-0.03em]">
          <span className="block">Votre idée.</span>
          <span className="block">Notre plateforme.</span>
          <span className="block italic">Votre succès.</span>
        </h2>
        <figure className="mt-10 w-full border-t border-white/20 pt-8">
          <Quote className="mx-auto h-6 w-6 text-white/50" aria-hidden="true" />
          <blockquote className="mt-3 text-lg font-medium leading-snug text-white">
            Chaque grande entreprise commence par une idée. La différence se joue dans l&apos;exécution.
          </blockquote>
          <figcaption className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">
            De l&apos;idée à l&apos;entreprise
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
