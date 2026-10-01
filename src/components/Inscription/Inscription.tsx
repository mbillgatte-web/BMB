"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Lock, Mail, Phone, User } from "lucide-react";
import Button from "@/components/ui/Button";
import { Separateur } from "@/components/auth/LoginForm";
import GoogleIcon from "@/components/ui/GoogleIcon";
import { FormError, PasswordField, TextField } from "@/components/ui/Field";
import { supabase } from "@/lib/supabase/browser";
import { cn } from "@/lib/cn";

const MOT_DE_PASSE_MIN = 6;

const ETAPES = [
  { titre: "Vous", sousTitre: "Pour savoir à qui nous parlons." },
  { titre: "Votre accès", sousTitre: "L'email et le mot de passe qui vous serviront à vous connecter." },
] as const;

type FieldErrors = { password?: string; confirmPassword?: string };

// Messages Supabase (en anglais) les plus fréquents à l'inscription.
function traduireErreur(message: string | undefined): string {
  if (!message) return "Inscription impossible pour le moment. Réessayez dans un instant.";
  if (/already registered/i.test(message)) {
    return "Un compte existe déjà avec cet email. Connectez-vous plutôt.";
  }
  if (/invalid.*email|email.*invalid/i.test(message)) {
    return "Cette adresse email n'est pas valide.";
  }
  return message;
}

/** Score 0 à 4 : longueur, chiffres, majuscules, caractères spéciaux. */
function solidite(motDePasse: string): { score: number; libelle: string } {
  if (!motDePasse) return { score: 0, libelle: "" };
  if (motDePasse.length < MOT_DE_PASSE_MIN) return { score: 1, libelle: "Trop court" };
  let score = 1;
  if (motDePasse.length >= 10) score++;
  if (/\d/.test(motDePasse) && /[a-zA-Z]/.test(motDePasse)) score++;
  if (/[A-Z]/.test(motDePasse) && /[^a-zA-Z0-9]/.test(motDePasse)) score++;
  return { score, libelle: ["", "Faible", "Correct", "Bon", "Solide"][score] };
}

const COULEUR_SOLIDITE = ["", "bg-error", "bg-amber-500", "bg-primary", "bg-secondary"];

export default function RegisterForm() {
  const [etape, setEtape] = useState<0 | 1>(0);
  const [direction, setDirection] = useState(1);
  const [name, setName] = useState("");
  const [prenom, setPrenom] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Google n'est pas encore branché : un clic affiche un court message.
  const [annonceGoogle, setAnnonceGoogle] = useState(false);
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const allerA = (cible: 0 | 1) => {
    setDirection(cible > etape ? 1 : -1);
    setEtape(cible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Étape 1 : les champs `required` sont déjà validés par le navigateur.
    if (etape === 0) {
      allerA(1);
      return;
    }

    setError("");
    const errors: FieldErrors = {};
    if (password.length < MOT_DE_PASSE_MIN) {
      errors.password = `Au moins ${MOT_DE_PASSE_MIN} caractères.`;
    }
    if (confirmPassword !== password) {
      errors.confirmPassword = "Les deux mots de passe ne correspondent pas.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // route.ts lit "nom" (pas "name") pour la colonne "nom" de la table
      // "compte" : la clé JSON doit correspondre à ce que route.ts attend.
      body: JSON.stringify({ nom: name, email, password, prenom, contact }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(traduireErreur(data.error));
      return;
    }

    // Si la confirmation d'email est désactivée dans Supabase, signUp
    // renvoie directement une session : on la réplique dans le client
    // du navigateur pour que l'utilisateur soit connecté tout de suite.
    if (data.session) {
      await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    router.push("/dashboard");
  };

  const force = solidite(password);
  const decalage = reduceMotion ? 0 : 24;

  return (
    <div className="cascade-floue">
      <h1 className="text-[32px] font-normal leading-[1.1] tracking-[-0.03em] text-on-surface">
        Créer votre <em className="font-semibold text-primary">compte</em>
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-on-surface">
        Votre entreprise, son logo et son site web, réunis au même endroit.
      </p>

      {/* Progression : deux segments qui se remplissent */}
      <div className="mt-7">
        <div className="flex gap-2" aria-hidden="true">
          {ETAPES.map((e, i) => (
            <span key={e.titre} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-container-high">
              <motion.span
                className="block h-full origin-left rounded-full bg-primary"
                initial={false}
                animate={{ scaleX: i <= etape ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.2, 0.7, 0.2, 1] }}
              />
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm text-on-surface-variant">
          <span className="font-medium text-on-surface">
            Étape {etape + 1} sur {ETAPES.length} · {ETAPES[etape].titre}
          </span>
          <span className="block">{ETAPES[etape].sousTitre}</span>
        </p>
      </div>

      <form className="mt-7" onSubmit={handleSubmit}>
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={etape}
            custom={direction}
            initial={{ opacity: 0, x: direction * decalage }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -decalage }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="space-y-5"
          >
            {etape === 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <TextField
                    label="Prénom"
                    icon={User}
                    name="prenom"
                    autoComplete="given-name"
                    required
                    autoFocus
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                  />
                  <TextField
                    label="Nom"
                    icon={User}
                    name="nom"
                    autoComplete="family-name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <TextField
                  label="Téléphone"
                  icon={Phone}
                  type="tel"
                  name="contact"
                  autoComplete="tel"
                  placeholder="+237 6XX XX XX XX"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />

                <Button type="submit" size="lg" className="w-full">
                  Continuer
                </Button>
              </>
            ) : (
              <>
                <TextField
                  label="Adresse email"
                  icon={Mail}
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="vous@entreprise.com"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <div>
                  <PasswordField
                    label="Mot de passe"
                    icon={Lock}
                    name="password"
                    autoComplete="new-password"
                    required
                    error={fieldErrors.password}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
                    }}
                  />
                  {!fieldErrors.password && (
                    <div className="mt-2 flex items-center gap-3" aria-live="polite">
                      <div className="flex flex-1 gap-1" aria-hidden="true">
                        {[1, 2, 3, 4].map((n) => (
                          <span key={n} className="h-1 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                            <motion.span
                              className={cn("block h-full origin-left rounded-full", COULEUR_SOLIDITE[force.score])}
                              initial={false}
                              animate={{ scaleX: n <= force.score ? 1 : 0 }}
                              transition={{ duration: reduceMotion ? 0 : 0.3, ease: "easeOut" }}
                            />
                          </span>
                        ))}
                      </div>
                      <span className="w-20 text-right text-xs text-on-surface-variant">
                        {force.libelle || `${MOT_DE_PASSE_MIN} caractères min.`}
                      </span>
                    </div>
                  )}
                </div>

                <PasswordField
                  label="Confirmer le mot de passe"
                  icon={Lock}
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  error={fieldErrors.confirmPassword}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((f) => ({ ...f, confirmPassword: undefined }));
                    }
                  }}
                />

                {error && <FormError>{error}</FormError>}

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={() => allerA(0)}
                    className="shrink-0 px-3"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Retour
                  </Button>
                  <Button type="submit" size="lg" loading={loading} className="flex-1">
                    {loading ? "Création du compte…" : "Créer mon compte"}
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </form>

      {/* Email d'abord, Google ensuite en alternative. Le bloc n'a de sens
          qu'à l'étape 1 : il se replie quand on passe à l'étape 2. */}
      <AnimatePresence initial={false}>
        {etape === 0 && (
          <motion.div
            key="google"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.2, 0.7, 0.2, 1] }}
            className="overflow-hidden"
          >
            <Separateur>Ou</Separateur>
            <Button
              variant="secondary"
              size="lg"
              className="w-full"
              aria-describedby={annonceGoogle ? "annonce-google-inscription" : undefined}
              onClick={() => setAnnonceGoogle(true)}
            >
              <GoogleIcon />
              Continuer avec Google
            </Button>
            {annonceGoogle && (
              <p
                id="annonce-google-inscription"
                role="status"
                className="animate-rise-in mt-2 text-center text-[13px] text-on-surface-variant"
              >
                L&apos;inscription avec Google arrive bientôt.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
