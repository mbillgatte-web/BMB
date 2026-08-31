"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur de connexion");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-[440px]">
      {/* Logo */}
      <div className="mb-xl flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary text-headline-lg font-headline-lg">
          Logo
        </span>
        <span className="font-headline-md text-headline-md font-extrabold text-primary">
          Build My Businessa
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
        <div>
          <label className="block font-body-sm text-body-sm text-on-surface-variant mb-xs" htmlFor="email">
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

        <div>
          <div className="flex justify-between items-center mb-xs">
            <label className="block font-body-sm text-body-sm text-on-surface-variant" htmlFor="password">
              Mot de passe
            </label>
            <a className="font-body-sm text-body-sm text-primary hover:text-on-primary-fixed-variant transition-colors" href="#">
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
            <Button
              variant="icon"
              size="sm"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </Button>
          </div>
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-primary focus:ring-primary-fixed-dim border-outline-variant rounded bg-surface transition-colors cursor-pointer"
          />
          <label className="ml-xs block font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="remember-me">
            Se souvenir de moi
          </label>
        </div>

        {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Connexion..." : "Se connecter"}
        </Button>

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

        <Button variant="secondary" size="lg" className="w-full">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuer avec Google
        </Button>
      </form>

      <div className="mt-lg text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Vous n&apos;avez pas de compte ?
          <Link
            href="/Inscription"
            className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant transition-colors ml-xs"
          >
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}