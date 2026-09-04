import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import VisualGenerator from "@/components/Visuels/VisualGenerator";
import { VISUAL_FORMATS } from "@/components/Visuels/visuels-data";
import { getVisuelsByCategory } from "@/lib/visuelsFs";

export default function VisuelsPage() {
  // Lecture de public/visuels/<formatId>/ côté serveur (fs) : c'est pour ça
  // que ce fichier n'a PAS "use client" en haut -- fs n'existe pas dans le
  // navigateur. Le résultat est transmis en props au composant client.
  const imagesByCategory = getVisuelsByCategory(
    VISUAL_FORMATS.map((format) => format.id)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background antialiased">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="mx-auto w-full max-w-[1280px] pb-24">
            <VisualGenerator imagesByCategory={imagesByCategory} />
          </div>
        </main>
      </div>
    </div>
  );
}
