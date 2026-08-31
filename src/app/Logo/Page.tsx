import LogoBuilder from "@/components/Identite_visuel/LogoBuilder";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";


import { ArrowRight } from 'lucide-react';



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

export default function LogoPage({ text = "Modern Button" }: { text?: string }) {
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



{/* bouton 21first */}

            <button className="group relative flex items-center gap-1 overflow-hidden rounded-[100px] border-[1.5px] border-[#333333]/40 bg-transparent px-8 py-3 text-sm font-semibold text-[#111111] cursor-pointer transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-transparent hover:text-white hover:rounded-[12px] active:scale-[0.95]">
      {/* Left arrow (arr-2) */}
      <ArrowRight 
        className="absolute w-4 h-4 left-[-25%] stroke-[#111111] fill-none z-[9] group-hover:left-4 group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />

      {/* Text */}
      <span className="relative z-[1] -translate-x-3 group-hover:translate-x-3 transition-all duration-[800ms] ease-out">
        {text}
      </span>

      {/* Circle */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#111111] rounded-[50%] opacity-0 group-hover:w-[220px] group-hover:h-[220px] group-hover:opacity-100 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)]"></span>

      {/* Right arrow (arr-1) */}
      <ArrowRight 
        className="absolute w-4 h-4 right-4 stroke-[#111111] fill-none z-[9] group-hover:right-[-25%] group-hover:stroke-white transition-all duration-[800ms] ease-[cubic-bezier(0.34,1.56,0.64,1)]" 
      />
    </button>

    

            <LogoBuilder />
          </div>
        </main>
      </div>
    </div>
  );
}


// This is file of your component



