"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Branchement Supabase Auth à faire ici plus tard
    console.log({ email, password, rememberMe });
  }

  return (
    <div className="flex flex-1 w-full h-full">
      {/* Colonne gauche : formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-md md:p-2xl bg-surface-container-lowest">
        <div className="w-full max-w-[440px]">
          {/* Logo */}
          <div className="mb-xl flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary text-headline-lg font-headline-lg">
              rocket_launch
            </span>
            <span className="font-headline-md text-headline-md font-extrabold text-primary">
              AI Business Builder
            </span>
          </div>

          {/* Header */}
          <div className="mb-lg">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-sm hidden md:block">
              Bienvenue dans votre espace entrepreneurial
            </h1>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-sm block md:hidden">
              Bienvenue dans votre espace entrepreneurial
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Connectez-vous pour continuer à bâtir votre avenir.
            </p>
          </div>

          {/* Formulaire */}
          <form className="space-y-md" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label
                className="block font-body-sm text-body-sm text-on-surface-variant mb-xs"
                htmlFor="email"
              >
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="nom@entreprise.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-sm py-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all text-on-surface placeholder:text-outline"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex justify-between items-center mb-xs">
                <label
                  className="block font-body-sm text-body-sm text-on-surface-variant"
                  htmlFor="password"
                >
                  Mot de passe
                </label>
                <a
                  className="font-body-sm text-body-sm text-primary hover:text-on-primary-fixed-variant transition-colors"
                  href="#"
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-sm py-sm border border-outline-variant rounded-lg bg-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-fixed-dim transition-all text-on-surface placeholder:text-outline"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-sm top-1/2 -translate-y-1/2 text-outline hover:text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Se souvenir de moi */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary-fixed-dim border-outline-variant rounded bg-surface transition-colors cursor-pointer"
              />
              <label
                className="ml-xs block font-body-sm text-body-sm text-on-surface-variant cursor-pointer"
                htmlFor="remember-me"
              >
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton principal */}
            <button
              type="submit"
              className="w-full py-sm px-md rounded-lg font-label-md text-label-md text-on-primary bg-gradient-to-r from-primary to-[#4F46E5] hover:from-[#4F46E5] hover:to-primary shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-xs"
            >
              Se connecter
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>

            {/* Séparateur */}
            <div className="relative py-sm">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-sm bg-surface-container-lowest font-body-sm text-body-sm text-on-surface-variant">
                  Ou
                </span>
              </div>
            </div>

            {/* Bouton Google */}
            <button
              type="button"
              className="w-full py-sm px-md rounded-lg font-label-md text-label-md text-on-surface bg-surface border border-outline-variant hover:bg-surface-container-low transition-all flex items-center justify-center gap-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuer avec Google
            </button>
          </form>

          {/* Footer */}
          <div className="mt-lg text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Vous n&apos;avez pas de compte ?
              <a
                className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors ml-xs"
                href="#"
              >
                Créer un compte
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Colonne droite : visuel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-primary-container via-surface-tint to-primary overflow-hidden items-center justify-center p-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary-fixed rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-inverse-primary rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center backdrop-blur-sm bg-surface/10 p-lg rounded-2xl border border-surface/20 shadow-lg">
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
      </div>
    </div>
  );
}
