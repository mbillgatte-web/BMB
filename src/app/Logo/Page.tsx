import { Suspense } from "react";
import LogoBuilder from "@/components/Identite_visuel/LogoBuilder";
import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import BrandProgressStepper from "@/components/Identite_visuel/BrandProgessStepper";

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
            <BrandProgressStepper currentStep={4} />

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



