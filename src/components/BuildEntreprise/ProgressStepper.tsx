export default function ProgressStepper({ currentStep = 1 }) {
  const steps = [
    { number: 1, label: "Fondateur" },
    { number: 2, label: "Identité" },
    { number: 3, label: "Opérations" },
  ];

  const progressWidth = `${((currentStep - 1) / (steps.length - 1)) * 100}%`;

  return (
    <div className="mb-8 relative">
      {/* Background line */}
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant/30 -translate-y-1/2 z-0" />
      {/* Progress line */}
      <div
        className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
        style={{ width: progressWidth }}
      />

      <div className="relative z-10 flex justify-between">
        {steps.map((step) => {
          const isActive = step.number === currentStep;
          const isCompleted = step.number < currentStep;

          return (
            <div key={step.number} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-label-md shadow-sm ring-4 ring-[#F9FAFB] ${
                  isActive || isCompleted
                    ? "bg-primary text-white"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`font-label-md text-sm ${
                  isActive ? "text-primary" : "text-on-surface-variant"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}