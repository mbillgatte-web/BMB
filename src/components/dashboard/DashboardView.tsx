import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import HeroSection from "./HeroSection";
import KpiCards from "./KpiCards";
import AIRecommendation from "./AIRecommendation";

export default function DashboardView() {
  return (
    <div className="bg-background text-on-background font-body-md antialiased flex h-screen overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative">
        <TopNav />

        <div className="flex-1 overflow-y-auto p-gutter relative z-0">
          <div className="max-w-container-max mx-auto space-y-xl pb-2xl">
            <HeroSection />
            <KpiCards />
            <AIRecommendation />
          </div>
        </div>
      </main>
    </div>
  );
}
