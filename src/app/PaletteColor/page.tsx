import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import PaletteBuilder from "@/components/Identite_visuel/PaletteBuilder";

function BrandProgressStepper({ currentStep }: { currentStep: number }) {
  const steps = ["Palette", "Typographie", "Logo"];

  return (
    <nav aria-label="Progression de l’identité visuelle" className="mb-8 flex items-center gap-4">
      {steps.map((label, index) => {
        const step = index + 1;
        const active = step === currentStep;

        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                active
                  ? "bg-primary text-on-primary"
                  : "bg-surface-variant text-on-surface-variant"
              }`}
            >
              {step}
            </span>
            <span className="text-sm font-medium text-on-surface">{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

export default function PaletteColorPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background antialiased">
      <Sidebar />

      <div className="relative flex h-screen flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="mx-auto w-full max-w-[1280px] pb-24">
            <div className="mb-8">
              <h1 className="font-headline-lg text-[36px] font-extrabold tracking-tight text-on-surface">
                Palette de couleurs
              </h1>

              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Choisissez les couleurs qui définiront l’identité visuelle de
                votre entreprise.
              </p>
            </div>

            <BrandProgressStepper currentStep={1} />

            <PaletteBuilder />
          </div>
        </main>
      </div>
    </div>
  );
}