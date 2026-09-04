interface BrandProgressStepperProps {
  /** Étape active, 1-indexée par rapport à `steps`. */
  currentStep: number;
  /** Libellés des étapes ; par défaut le parcours complet de l'identité visuelle. */
  steps?: string[];
}

const DEFAULT_STEPS = ["Vue d'ensemble", "Palette", "Typographie", "Logo"];

/**
 * Repère de progression partagé par les pages sous "Identité visuelle"
 * (voir src/app/IdentiteVisuelle, PaletteColor, Typographie, Logo). Les
 * pourcentages sont dérivés de steps.length pour rester corrects quel que
 * soit le nombre d'étapes passé, au lieu d'un %-en-dur pensé pour 3 étapes.
 */
export default function BrandProgressStepper({
  currentStep,
  steps = DEFAULT_STEPS,
}: BrandProgressStepperProps) {
  const progress = `${((currentStep - 1) / (steps.length - 1)) * 100}%`;
  const edgeInset = `${100 / (steps.length * 2)}%`;
  const trackWidthPercent = ((steps.length - 1) / steps.length) * 100;

  return (
    <nav
      aria-label="Progression de l’identité visuelle"
      className="relative mb-10 flex w-full items-start justify-between"
    >
      <div
        className="absolute top-5 h-1 -translate-y-1/2 rounded-full bg-outline-variant/40"
        style={{ left: edgeInset, right: edgeInset }}
      />
      <div
        className="absolute top-5 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500"
        style={{
          left: edgeInset,
          width: `calc(${progress} * ${trackWidthPercent}% / 100)`,
        }}
      />

      {steps.map((label, index) => {
        const step = index + 1;
        const active = step === currentStep;
        const completed = step < currentStep;

        return (
          <div
            key={label}
            className="relative z-10 flex flex-col items-center gap-2"
            style={{ width: `${100 / steps.length}%` }}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-[#F9FAFB] text-sm font-semibold shadow-sm ${
                active || completed
                  ? "bg-primary text-on-primary"
                  : "bg-surface-variant text-on-surface-variant"
              }`}
            >
              {step}
            </span>
            <span
              className={`text-center text-sm font-medium ${
                active ? "text-primary" : "text-on-surface-variant"
              }`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </nav>
  );
}
