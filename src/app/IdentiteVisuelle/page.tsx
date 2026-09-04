import { Suspense } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import VueEnsemble from "@/components/Identite_visuel/VueEnsemble";
import BrandProgressStepper from "@/components/Identite_visuel/BrandProgessStepper";

export default function IdentiteVisuellePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background antialiased">
      <Sidebar />

      <div className="relative flex h-screen flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="mx-auto w-full max-w-[1280px] pb-24">
            <div className="mb-8">
              <h1 className="font-headline-lg text-[36px] font-extrabold tracking-tight text-on-surface">
                Identité visuelle
              </h1>

              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Retrouvez ici, en un coup d’œil, la palette, la typographie et
                le logo déjà configurés pour votre entreprise.
              </p>
            </div>

            <BrandProgressStepper currentStep={1} />

            <Suspense fallback={null}>
              <VueEnsemble />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
