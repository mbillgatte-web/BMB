// components/AuthLayout.tsx
"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
  mode: "login" | "register";
};

export default function AuthLayout({ children, mode }: AuthLayoutProps) {
  const isLogin = mode === "login";

  return (
    <div className="flex w-full h-screen">
      {/* Panneau formulaire */}
      <motion.div
        layout
        layoutId="form-panel"
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`w-full lg:w-1/2 flex items-center justify-center overflow-y-auto scrollbar-hide p-md md:p-2xl bg-surface-container-lowest ${isLogin ? "order-1" : "order-2"}`}
      >
        {children}
      </motion.div>

      {/* Panneau quote/visuel */}
      <motion.div
        layout
        layoutId="quote-panel"
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className={`hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-container via-surface-tint to-primary overflow-hidden flex-col items-center justify-center p-3xl ${isLogin ? "order-2" : "order-1"}`}
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-inverse-primary rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Titre + logo, superposé juste au-dessus de la citation */}
        <div className="relative z-10 flex items-center gap-xs mb-lg">
          {/* Espace logo — remplace par <img src="/logo.svg" alt="Logo" className="w-8 h-8" /> */}
          <span className="material-symbols-outlined text-on-primary text-[32px]">
            hub
          </span>
          <div className="flex flex-col items-start leading-tight">
            <span className="font-headline-sm text-[55px] font-extrabold text-on-primary">
              Build My Businessa
            </span>
            <span className="font-body-sm text-body-md text-on-primary/70">
              Votre idée. Notre plateforme. Votre succès.
            </span>
          </div>
        </div>

        {/* Titre contextuel de la page */}
        <div className="relative z-10 mb-lg max-w-[480px] text-center">
          <h1 className="font-headline-lg text-headline-lg text-on-primary mb-sm">
            {isLogin ? "Bienvenue dans votre espace entrepreneurial" : "Créez votre compte"}
          </h1>
          <p className="font-body-md text-body-md text-on-primary/70">
            {isLogin
              ? "Connectez-vous pour continuer à bâtir votre avenir."
              : "Rejoignez des milliers d'entrepreneurs et commencez à bâtir votre projet dès aujourd'hui."}
          </p>
        </div>








        {/* Citation */}
        <div className="relative z-10 w-full max-w-[560px] text-center backdrop-blur-sm bg-surface/10 p-lg rounded-2xl border border-surface/20 shadow-lg">
          <span className="material-symbols-outlined text-on-primary text-[48px] mb-sm block opacity-80">
            format_quote
          </span>
          <p className="font-headline-lg text-headline-lg text-on-primary mb-md leading-tight">
            &ldquo;Chaque grande entreprise commence par une idée. La différence se joue dans l&apos;exécution.&rdquo;
          </p>
          <div className="flex items-center justify-center gap-sm mt-lg">
            <div className="h-px w-12 bg-on-primary/30"></div>
            <span className="font-label-md text-label-md text-primary-fixed-dim uppercase tracking-wider">
              Vision to Reality
            </span>
            <div className="h-px w-12 bg-on-primary/30"></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}