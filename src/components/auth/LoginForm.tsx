"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import GoogleIcon from "@/components/ui/GoogleIcon";
import { FormError, PasswordField, TextField } from "@/components/ui/Field";
import { supabase } from "@/lib/supabase/browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Fonctions pas encore branchées : un clic affiche un court message sous
  // le contrôle concerné au lieu de ne rien faire.
  const [annonce, setAnnonce] = useState<"google" | "oubli" | null>(null);
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

    if (!res.ok) {
      setLoading(false);
      // Supabase répond en anglais pour le cas le plus fréquent : on le
      // traduit et on dit quoi faire.
      setError(
        data.error === "Invalid login credentials"
          ? "Email ou mot de passe incorrect. Vérifiez vos informations et réessayez."
          : data.error || "Connexion impossible pour le moment. Réessayez dans un instant."
      );
      return;
    }

    // /api/login authentifie côté serveur ; on doit répliquer la session
    // dans le client Supabase du navigateur pour que les autres pages
    // (ex: création d'entreprise) puissent savoir qui est connecté.
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    router.push("/dashboard");
  };

  return (
    <div className="cascade-floue">
      {/* Titre neutre : la page sert autant à la première connexion (juste
          après l'inscription) qu'aux suivantes. */}
      <h1 className="text-[32px] font-normal leading-[1.1] tracking-[-0.03em] text-on-surface">
        <em className="font-semibold text-primary">Bienvenue</em>.
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-on-surface">
        Connectez-vous pour accéder à vos projets, votre identité visuelle et votre site.
      </p>

      <form className="cascade-floue mt-7 space-y-5 [--cascade-depart:240ms]" onSubmit={handleSubmit}>
        <TextField
          label="Adresse email"
          icon={Mail}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="vous@entreprise.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField
          label="Mot de passe"
          icon={Lock}
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          hint={annonce === "oubli" ? "La réinitialisation du mot de passe arrive bientôt." : undefined}
          labelAside={
            <button
              type="button"
              onClick={() => setAnnonce("oubli")}
              className="-my-2 cursor-pointer rounded-md py-2 text-[13px] font-medium text-primary underline-offset-4 transition-colors hover:text-primary-hover hover:underline"
            >
              Mot de passe oublié ?
            </button>
          }
        />

        {error && <FormError>{error}</FormError>}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      {/* Email d'abord (le moyen principal), Google ensuite en alternative. */}
      <Separateur>Ou</Separateur>

      <div>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          aria-describedby={annonce === "google" ? "annonce-google" : undefined}
          onClick={() => setAnnonce("google")}
        >
          <GoogleIcon />
          Continuer avec Google
        </Button>
        {annonce === "google" && (
          <p id="annonce-google" role="status" className="animate-rise-in mt-2 text-center text-[13px] text-on-surface-variant">
            La connexion avec Google arrive bientôt.
          </p>
        )}
      </div>
    </div>
  );
}

/** Séparateur « OU PAR EMAIL » en petites capitales espacées. */
export function Separateur({
  children,
  className = "my-6",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`${className} flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant`}>
      <span className="h-px flex-1 bg-outline-variant" aria-hidden="true" />
      {children}
      <span className="h-px flex-1 bg-outline-variant" aria-hidden="true" />
    </div>
  );
}
