import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import HeroWelcomeText from "./HeroWelcomeText";
import IdentityKpis from "./IdentityKpis";
import AIRecommendation from "./AIRecommendation";
import HeroFluidBackground from "./HeroFluidBackground";
import DashboardNextSteps from "./DashboardNextSteps";

export default function DashboardView() {
  return (
    // Coque gris-vert (voir `canvas` dans tailwind.config.ts) sur laquelle le
    // panneau sidebar+contenu flotte avec sa propre ombre -- inspiré du
    // modèle fourni par l'utilisateur (aperçu "Indigo Clair" validé avant
    // implémentation). Le padding est ce qui laisse voir le gris-vert sur les
    // bords ; sans lui le panneau reprendrait tout l'écran comme avant.
    <div className="flex h-screen items-stretch bg-canvas p-2 antialiased font-body-md text-on-background lg:p-4">
      <div className="flex flex-1 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_40px_80px_-36px_rgba(20,50,30,0.35)]">
        <Sidebar />

        <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-surface-container-lowest">
          <TopNav />

          <div className="relative z-0 flex-1 overflow-y-auto px-md pb-gutter pt-0 md:px-gutter">
            {/* Sous `md`, les deux sections deviennent `display: contents` :
                leurs enfants remontent dans cette colonne flex et sont
                réordonnés avec `order` (le geste à faire d'abord, puis la
                bande d'avancement, puis la feuille de route) sans dupliquer
                les composants -- chaque hook ferait sinon ses requêtes deux
                fois. À partir de `md`, rien ne change : même DOM, mêmes
                classes qu'avant. */}
            <div className="max-w-container-max mx-auto flex flex-col gap-md pb-2xl md:block md:space-y-xl">
              <section className="relative flex min-h-[420px] flex-col items-center justify-start gap-md overflow-hidden rounded-3xl p-lg pt-3 pb-lg max-md:contents sm:px-xl">
                {/* Le fond animé n'a pas de conteneur mesurable quand la
                    section est en `contents` ; on le coupe sous `md`, ce qui
                    épargne aussi une boucle de dessin plein écran au téléphone. */}
                <div className="absolute inset-0 hidden md:block">
                  <HeroFluidBackground />
                </div>
                <IdentityKpis />
                <HeroWelcomeText />
              </section>
              <DashboardNextSteps />
              {/* <AIRecommendation /> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
