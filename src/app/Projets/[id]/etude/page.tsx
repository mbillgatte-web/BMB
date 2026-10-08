import Sidebar from "@/components/dashboard/Sidebar";
import TopNav from "@/components/dashboard/TopNav";
import EtudeSection from "@/components/Etude/EtudeSection";

// Même coque que /Projets : sidebar + barre du haut, contenu centré (plus
// étroit ici : un questionnaire se lit mieux sur une colonne).
//
// `params` est une Promise dans cette version de Next : on l'attend ici,
// côté serveur, et on passe l'id au composant client qui fait les lectures.
export default async function EtudePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background antialiased">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#F9FAFB]">
        <TopNav />

        <main className="flex-1 overflow-y-auto p-6 lg:p-12">
          <div className="mx-auto w-full max-w-[820px] pb-24">
            <EtudeSection projetId={id} />
          </div>
        </main>
      </div>
    </div>
  );
}
