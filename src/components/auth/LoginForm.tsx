"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import SoonBadge from "@/components/ui/SoonBadge";
import GoogleIcon from "@/components/ui/GoogleIcon";
import { FormError, PasswordField, TextField } from "@/components/ui/Field";
import { supabase } from "@/lib/supabase/browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
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
    <div className="stagger-in">
      <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] text-on-surface">
        Connexion
      </h1>
      <p className="mt-2 text-[15px] text-on-surface-variant">
        Reprenez là où vous vous êtes arrêté.
      </p>

      <form className="stagger-in mt-8 space-y-5" onSubmit={handleSubmit}>
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
          labelAside={
            <span className="inline-flex items-center gap-1.5 text-[13px] text-outline">
              Mot de passe oublié
              <SoonBadge />
            </span>
          }
        />

        <label className="flex w-fit cursor-not-allowed items-center gap-2.5 text-sm text-outline">
          <input
            type="checkbox"
            disabled
            className="h-4 w-4 rounded border-border-strong text-primary"
          />
          Se souvenir de moi
          <SoonBadge />
        </label>

        {error && <FormError>{error}</FormError>}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[13px] text-outline">
        <span className="h-px flex-1 bg-outline-variant" />
        ou
        <span className="h-px flex-1 bg-outline-variant" />
      </div>

      <Button variant="secondary" size="lg" className="w-full" disabled>
        <GoogleIcon />
        Continuer avec Google
        <SoonBadge />
      </Button>
    </div>
  );
}
