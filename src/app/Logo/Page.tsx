import { Suspense } from "react";
import LogoBuilder from "@/components/Identite_visuel/LogoBuilder";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";

function BrandProgressStepper({ currentStep }: { currentStep: number }) {
  const steps = ["Palette", "Typographie", "Logo"];
  const progress = `${((currentStep - 1) / (steps.length - 1)) * 100}%`;

  return (
    <nav
      aria-label="Progression de l’identité visuelle"
      className="relative mb-10 flex w-full items-start justify-between"
    >
      <div className="absolute left-[16.666%] right-[16.666%] top-5 h-1 -translate-y-1/2 rounded-full bg-outline-variant/40" />
      <div
        className="absolute left-[16.666%] top-5 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500"
        style={{ width: `calc(${progress} * 66.666% / 100)` }}
      />

      {steps.map((label, index) => {
        const step = index + 1;
        const active = step === currentStep;
        const completed = step < currentStep;

        return (
          <div key={label} className="relative z-10 flex w-1/3 flex-col items-center gap-2">
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

export default function LogoPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background antialiased">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="mx-auto w-full max-w-[1280px] pb-24">
            <div className="mb-8">
              <h1 className="font-headline-lg text-[36px] font-extrabold tracking-tight text-on-surface">
                Logo de votre marque
              </h1>

              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Personnalisez le logo de votre marque pour qu’il reflète l’identité visuelle de votre entreprise. Vous pouvez télécharger votre logo existant ou en créer un nouveau à l’aide de notre outil de création de logo.
              </p>
            </div>
            
            {/* barre de progression */}
            <BrandProgressStepper currentStep={3} />

            <Suspense fallback={null}>
              <LogoBuilder />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}


// This is file of your component



