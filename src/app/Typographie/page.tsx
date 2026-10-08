import { Suspense } from "react";
import Police from "@/components/Identite_visuel/police";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import BrandProgressStepper from "@/components/Identite_visuel/BrandProgessStepper";

export default function PolicePage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background antialiased">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-surface">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="mx-auto w-full max-w-[1280px] pb-24">
            <div className="mb-8">
              <h1 className="font-headline-lg text-[36px] font-extrabold tracking-tight text-on-surface">
                Typographie
              </h1>

              <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
                Choisissez les polices qui définiront l’identité de votre
                marque.
              </p>
            </div>

            <BrandProgressStepper currentStep={3} />

            <Suspense fallback={null}>
              <Police />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}