import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import HeroFluidBackground from "./HeroFluidBackground";
import HeroWelcomeText from "./HeroWelcomeText";
import BrandIdentityShowcase from "./BrandIdentityShowcase";
import ActiveProjectsKpi from "./ActiveProjectsKpi";
import AIRecommendation from "./AIRecommendation";
import DashboardNextSteps from "./DashboardNextSteps";

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
              {/* Hero section du dashboard : fond animé (HeroFluidBackground)
                  derrière un texte de bienvenue centré + la ligne de tuiles
                  KPI. BrandIdentityShowcase + ActiveProjectsKpi occupent 2
                  cases, les 2 autres attendent les prochains KPI. */}
              <section className="relative flex min-h-[440px] flex-col items-center justify-center gap-xl overflow-hidden rounded-3xl p-lg">
                <HeroFluidBackground />
                <HeroWelcomeText />
                <div className="relative z-10 grid w-full grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
                  <BrandIdentityShowcase />
                  <ActiveProjectsKpi />
                </div>
              </section>
              <DashboardNextSteps />
              <AIRecommendation />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
