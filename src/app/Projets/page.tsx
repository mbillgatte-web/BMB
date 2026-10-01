import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import ProjetsSection from "@/components/Projets/ProjetsSection";

// Même coque que /Templates : sidebar + barre du haut, contenu centré.
export default function ProjetsPage() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background antialiased">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="mx-auto w-full max-w-[1280px] pb-24">
            <ProjetsSection />
          </div>
        </main>
      </div>
    </div>
  );
}
