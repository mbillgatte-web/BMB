export default function AIRecommendation() {
  return (
    <section className="bg-[#F5F3FF] rounded-[24px] border border-primary/20 p-lg shadow-sm">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
          <span className="material-symbols-outlined text-[24px]">psychology</span>
        </div>
        <div className="flex-1">
          <h3 className="font-headline-md text-[20px] font-bold text-primary mb-2">
            Recommandation IA
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4 max-w-3xl">
            D&apos;après l&apos;analyse de votre secteur d&apos;activité au
            Cameroun, la demande pour des espaces de coworking étudiants est
            en hausse de 45%. Je suggère d&apos;ajouter une section
            &laquo;&nbsp;Services Annexes&nbsp;&raquo; (impression, café) dans
            votre Business Plan pour maximiser la rentabilité.
          </p>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-primary text-white font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors">
              Appliquer au Business Plan
            </button>
            <button className="px-4 py-2 bg-white text-on-surface-variant border border-outline-variant font-label-md text-label-md rounded-lg hover:bg-surface-container transition-colors">
              Ignorer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
