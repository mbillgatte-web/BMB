"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [prenom, setPrenom] = useState("");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, prenom, contact }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erreur lors de l'inscription");
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-[460px]">
      {/* ===== HEADER / LOGO ===== */}
      <div className="mb-10">
        

        <div className="space-y-2">
          <h1 className="font-headline-lg text-headline-lg text-on-surface hidden md:block lg:hidden">
            Créez votre compte
          </h1>

          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface block md:hidden">
            Créez votre compte
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-[380px]">
            Rejoignez des milliers d’entrepreneurs et commencez à bâtir votre
            projet dès aujourd’hui.
          </p>
        </div>
      </div>

      {/* ===== FORMULAIRE ===== */}
      <form className="space-y-5" onSubmit={handleSubmit}>
        {/* Nom */}
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="block font-body-sm text-body-sm text-on-surface-variant"
          >
            Nom complet
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">
              person
            </span>
            <input
              id="nom"
              name="nom"
              type="text"
              placeholder="Mbeppa"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>


        {/* PreNom */}
        <div className="space-y-1.5">
          <label
            htmlFor="prenom"
            className="block font-body-sm text-body-sm text-on-surface-variant"
          >
            Prenom
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">
              person
            </span>
            <input
              id="prenom"
              name="prenom"
              type="text"
              placeholder="Bill"
              required
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>


                {/* Contact*/}
        <div className="space-y-1.5">
          <label
            htmlFor="contact"
            className="block font-body-sm text-body-sm text-on-surface-variant"
          >
            Tel
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">
              phone
            </span>
            <input
              id="contact"
              name="contact"
              type="tel"
              placeholder="(+237) 6 XXX"
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>



        {/* Email */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block font-body-sm text-body-sm text-on-surface-variant"
          >
            Adresse email
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">
              mail
            </span>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="nom@entreprise.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
          </div>
        </div>

        {/* Mot de passe */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="block font-body-sm text-body-sm text-on-surface-variant"
          >
            Mot de passe
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">
              lock
            </span>
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
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

        {/* Confirmation mot de passe */}
        <div className="space-y-1.5">
          <label
            htmlFor="confirmPassword"
            className="block font-body-sm text-body-sm text-on-surface-variant"
          >
            Confirmer le mot de passe
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline">
              lock
            </span>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full pl-11 pr-12 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
            />
            <Button
              variant="icon"
              size="sm"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={
                showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"
              }
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showConfirmPassword ? "visibility_off" : "visibility"}
              </span>
            </Button>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Bouton principal */}
        <Button type="submit" size="lg" loading={loading} className="w-full">
          {loading ? "Inscription en cours..." : "Créer mon compte"}
        </Button>

        {/* Séparateur */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-outline-variant/60" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-surface-container-lowest font-body-sm text-body-sm text-on-surface-variant">
              ou continuer avec
            </span>
          </div>
        </div>

        {/* Google */}
        <Button variant="secondary" size="lg" className="w-full">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        </Button>
      </form>

      {/* Lien connexion */}
      <div className="mt-8 pt-6 border-t border-outline-variant/40 text-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Vous avez déjà un compte ?{" "}
          <Link
            href="/"
            className="font-label-md text-label-md text-primary hover:text-[#4F46E5] transition-colors"
          >
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}