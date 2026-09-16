import Button from "@/components/ui/Button";

const KPIS = [
  {
    label: "Indice de maturité",
    icon: "trending_up",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary",
    value: "62",
    unit: "/100",
    progress: 62,
    progressColor: "bg-gradient-to-r from-primary to-primary-container",
    // Delta illustratif -- l'app ne calcule pas encore de variation d'une
    // période à l'autre pour ces deux indicateurs (voir le commentaire sur
    // /generate-visual pour la même logique de contenu d'exemple assumé).
    // À remplacer par une vraie valeur le jour où ce calcul existera.
    delta: "+8 pts",
  },
  {
    label: "Avancement",
    icon: "flag",
    iconBg: "bg-secondary-container/30",
    iconColor: "text-secondary",
    value: "34",
    unit: "%",
    progress: 34,
    progressColor: "bg-gradient-to-r from-primary to-primary-container",
    delta: "+5%",
  },
];

/** Pastille de tendance verte -- volontairement séparée de l'accent indigo
    (voir la palette validée : le sémantique positif/négatif ne doit jamais
    se confondre avec la couleur de marque). */
function DeltaPill({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-secondary-container/30 px-2.5 py-1 font-label-sm text-[11.5px] font-bold text-secondary">
      {children}
    </span>
  );
}

// Icône + libellé partagés par les 4 tuiles -- factorisé pour garder la
// même hauteur d'en-tête partout (voir le style de carte "compact" plus
// bas : mt-auto sur le pied de carte pour que les tuiles sans barre de
// progression ne laissent pas un vide sous leur contenu).
function KpiIcon({ bg, color, icon }: { bg: string; color: string; icon: string }) {
  return (
    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${bg}`}>
      <span className={`material-symbols-outlined ${color} text-[16px]`}>{icon}</span>
    </div>
  );
}

function KpiCardShell({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md">
      {children}
      <div className="mt-auto pt-3">{footer}</div>
    </div>
  );
}

export default function KpiCards() {
  return (
    <section className="grid grid-cols-1 gap-sm sm:grid-cols-2 sm:gap-md lg:grid-cols-4">
      {KPIS.map((kpi) => (
        <KpiCardShell
          key={kpi.label}
          footer={
            <div className="h-1.5 w-full rounded-full bg-surface-container-high">
              <div
                className={`${kpi.progressColor} h-1.5 rounded-full`}
                style={{ width: `${kpi.progress}%` }}
              />
            </div>
          }
        >
          <div className="mb-2 flex items-center justify-between">
            <KpiIcon bg={kpi.iconBg} color={kpi.iconColor} icon={kpi.icon} />
            <DeltaPill>{kpi.delta}</DeltaPill>
          </div>
          <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">
            {kpi.label}
          </h3>
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono-stats text-[26px] font-bold leading-none text-on-surface">
              {kpi.value}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {kpi.unit}
            </span>
          </div>
        </KpiCardShell>
      ))}

      <KpiCardShell
        footer={
          <p className="font-body-sm text-body-sm text-tertiary">3 urgentes aujourd&apos;hui</p>
        }
      >
        <div className="mb-2 flex items-center justify-between">
          <KpiIcon bg="bg-tertiary-container/20" color="text-tertiary" icon="checklist" />
        </div>
        <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">
          Tâches actives
        </h3>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono-stats text-[26px] font-bold leading-none text-on-surface">
            8
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">/23</span>
        </div>
      </KpiCardShell>

      <KpiCardShell
        footer={
          <Button variant="ghost" size="sm" className="-ml-3 text-primary">
            Commencer
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Button>
        }
      >
        <div className="mb-2 flex items-center justify-between">
          <KpiIcon bg="bg-surface-container-high" color="text-on-surface-variant" icon="arrow_forward" />
        </div>
        <h3 className="font-label-md text-label-md text-on-surface-variant mb-1">
          Prochaine étape
        </h3>
        <h4 className="font-headline-md text-body-lg font-bold text-on-surface line-clamp-2">
          Valider le Business Model Canvas
        </h4>
      </KpiCardShell>
    </section>
  );
}
