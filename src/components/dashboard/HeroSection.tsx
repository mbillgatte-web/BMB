import Button from "@/components/ui/Button";

export default function HeroSection() {
  return (
    <section className="relative bg-surface-container-lowest rounded-[24px] border border-outline-variant shadow-sm overflow-hidden p-2xl min-h-[400px] flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-surface-container-low to-surface-container-lowest opacity-50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center space-y-8 px-4 text-center">        <div>
          <h2 className="mb-4 font-display-lg text-[clamp(2rem,5vw,3rem)] leading-tight text-on-surface">
            Bienvenue dans votre espace
          </h2>
          <p className="w-full max-w-3xl font-body-lg text-body-lg text-on-surface-variant">
            Prêt à transformer votre vision en réalité ? Notre intelligence
            artificielle est là pour vous guider à chaque étape du processus
            entrepreneurial.
          </p>
        </div>

        <Button href="/BuildEntreprise" size="lg" className="text-base">
          Créer votre entreprise ici
        </Button>
      </div>

      
      
    </section>
  );
}
