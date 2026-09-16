import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import HeroSection from "./HeroSection";
import KpiCards from "./KpiCards";
import AIRecommendation from "./AIRecommendation";

export default function DashboardView() {
  return (
    // Coque lavande (voir `canvas` dans tailwind.config.ts) sur laquelle le
    // panneau sidebar+contenu flotte avec sa propre ombre -- inspiré du
    // modèle fourni par l'utilisateur (aperçu "Indigo Clair" validé avant
    // implémentation). Le padding est ce qui laisse voir le lavande sur les
    // bords ; sans lui le panneau reprendrait tout l'écran comme avant.
    <div className="flex h-screen items-stretch bg-canvas p-2 antialiased font-body-md text-on-background lg:p-4">
      <div className="flex flex-1 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_40px_80px_-36px_rgba(35,37,120,0.35)]">
        <Sidebar />

        <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-surface-container-lowest">
          <TopNav />

          <div className="relative z-0 flex-1 overflow-y-auto p-gutter">
            <div className="max-w-container-max mx-auto space-y-xl pb-2xl">
           
              <KpiCards />
              <AIRecommendation />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
