const steps = ["Palette", "Typographie", "Logo", "Kit de marque"];

export default function BrandProgressStepper({ currentStep = 1 }) {
  return (
    <div className="mb-10 flex w-full items-start justify-between">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const active = stepNumber === currentStep;
        const completed = stepNumber < currentStep;

        return (
          <div key={step} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                  active || completed
                    ? "bg-primary text-white"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {stepNumber}
              </div>

              <span
                className={`mt-2 whitespace-nowrap text-sm ${
                  active
                    ? "font-semibold text-primary"
                    : "text-on-surface-variant"
                }`}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={`mx-3 mb-6 h-0.5 flex-1 ${
                  completed ? "bg-primary" : "bg-outline-variant/40"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}