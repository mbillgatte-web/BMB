"use client";

import Link from "next/link";
import { ArrowRight, Check, CircleDashed, Palette, Sparkles } from "lucide-react";
import { useEntreprise } from "@/hooks/useEntreprise";
import { useIdentiteVisuelle } from "@/hooks/useIdentiteVisuelle";

const steps = [
  { label: "Créer votre entreprise", href: "/BuildEntreprise", key: "entreprise" },
  { label: "Définir votre palette", href: "/PaletteColor", key: "palette" },
  { label: "Choisir votre typographie", href: "/Typographie", key: "typographie" },
  { label: "Finaliser votre logo", href: "/Logo", key: "logo" },
] as const;

export default function DashboardNextSteps() {
  const { entreprise, loading: loadingEntreprise } = useEntreprise();
  const { identiteVisuelle, loading: loadingIdentite } = useIdentiteVisuelle(
    entreprise?.id ?? null
  );

  const status = {
    entreprise: Boolean(entreprise),
    palette: Boolean(identiteVisuelle?.couleur_primaire),
    typographie: Boolean(identiteVisuelle?.police_titre),
    logo: Boolean(identiteVisuelle?.logo_url),
  };
  const completed = steps.filter((step) => status[step.key]).length;
  const progress = Math.round((completed / steps.length) * 100);
  const nextStep = steps.find((step) => !status[step.key]);
  const loading = loadingEntreprise || loadingIdentite;
  const withEntreprise = (href: string) =>
    entreprise ? `${href}?entrepriseId=${entreprise.id}` : href;

  return (
    <section className="grid gap-md lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
      <div className="rounded-2xl border border-outline-variant/80 bg-surface p-lg shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-label-sm text-label-sm uppercase text-primary">Votre feuille de route</p>
            <h2 className="mt-2 font-headline-md text-headline-md text-on-surface">
              Construisez une marque cohérente
            </h2>
            <p className="mt-2 max-w-[34rem] font-body-sm text-body-sm text-on-surface-variant">
              Avancez étape par étape et gardez une vue claire de ce qui est déjà prêt.
            </p>
          </div>
          <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary-container/15 text-primary">
            <span className="font-headline-sm text-headline-sm">{loading ? "--" : `${progress}%`}</span>
            <span className="font-label-sm text-[10px]">complété</span>
          </div>
        </div>

        <div className="mt-lg h-2 overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${loading ? 0 : progress}%` }}
          />
        </div>

        <div className="mt-lg grid gap-2 sm:grid-cols-2">
          {steps.map((step) => {
            const isComplete = status[step.key];
            const href = step.key === "entreprise" ? step.href : withEntreprise(step.href);

            return (
              <Link
                key={step.key}
                href={href}
                className="group flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-outline-variant hover:bg-surface-container-low"
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    isComplete ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {isComplete ? <Check className="h-4 w-4" aria-hidden="true" /> : <CircleDashed className="h-4 w-4" aria-hidden="true" />}
                </span>
                <span className={`min-w-0 flex-1 font-body-sm text-body-sm ${isComplete ? "text-on-surface-variant line-through" : "text-on-surface"}`}>
                  {step.label}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-outline transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-[#14162A] p-lg text-white shadow-sm">
        <div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#AEB1FF]">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-label-sm text-[10px] uppercase tracking-[0.12em] text-white/50">À faire maintenant</span>
          </div>
          <h2 className="mt-7 font-headline-sm text-headline-sm text-white">
            {loading ? "Préparation de votre prochaine étape" : nextStep ? nextStep.label : "Votre identité est prête"}
          </h2>
          <p className="mt-2 font-body-sm text-body-sm text-white/60">
            {nextStep ? "Une petite étape suffit pour faire progresser votre projet." : "Vous pouvez maintenant explorer vos modèles et créer vos premiers visuels."}
          </p>
        </div>
        <Link
          href={nextStep ? (nextStep.key === "entreprise" ? nextStep.href : withEntreprise(nextStep.href)) : "/Templates"}
          className="mt-8 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-label-md text-label-md text-[#14162A] transition-transform hover:-translate-y-0.5"
        >
          <Palette className="h-4 w-4" aria-hidden="true" />
          {nextStep ? "Continuer" : "Voir les modèles"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}