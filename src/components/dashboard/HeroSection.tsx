import Link from "next/link";
export default function HeroSection() {
  return (
    <section className="relative bg-surface-container-lowest rounded-[24px] border border-outline-variant shadow-sm overflow-hidden p-2xl min-h-[400px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low to-surface-container-lowest opacity-50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto space-y-8">
        <div>
          <h2 className="font-display-lg text-display-lg text-on-surface mb-4">
            Bienvenue dans votre espace
          </h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Prêt à transformer votre vision en réalité ? Notre intelligence
            artificielle est là pour vous guider à chaque étape du processus
            entrepreneurial.
          </p>
        </div>

        <Link
          href="/BuildEntreprise"
          className="pulse-soft shimmer relative overflow-hidden group bg-gradient-to-r from-primary to-[#4F46E5] text-white px-12 py-6 rounded-[24px] shadow-[0_8px_30px_rgb(99,102,241,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(99,102,241,0.4)]"
        >
          <span className="relative z-10 flex items-center gap-3 font-headline-md text-headline-md">
            <span className="material-symbols-outlined text-[32px]">
             
            </span>
            Créer votre entreprise ici
          </span>
        </Link>
      </div>

      
      
    </section>
  );
}
