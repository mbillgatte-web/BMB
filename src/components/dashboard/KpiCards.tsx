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

function KpiIcon({ bg, color, icon }: { bg: string; color: string; icon: string }) {
  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${bg}`}>
      <span className={`material-symbols-outlined ${color} text-[18px]`}>{icon}</span>
    </div>
  );
}

// Tuile "stat" en ligne (icône + libellé/valeur + delta) au lieu d'une carte
// verticale -- beaucoup plus basse (~64px vs ~190px avant). La barre de
// progression, quand il y en a une, devient un simple liseré de 3px collé
// au bord bas de la tuile (position absolute) pour ne pas ajouter de
// hauteur au lieu de vivre dans un bloc dédié comme avant.
function KpiTile({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  unit,
  delta,
  progress,
  progressColor,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  progress?: number;
  progressColor?: string;
}) {
  return (
    <div className="relative flex items-center gap-3 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm transition-shadow hover:shadow-md">
      <KpiIcon bg={iconBg} color={iconColor} icon={icon} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-label-sm text-label-sm leading-tight text-on-surface-variant">
          {label}
        </p>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-stats text-mono-stats text-on-surface leading-none">
            {value}
          </span>
          {unit && <span className="text-[11px] text-on-surface-variant">{unit}</span>}
        </div>
      </div>
      {delta && <DeltaPill>{delta}</DeltaPill>}
      {progress != null && (
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-surface-container-high">
          <div className={`${progressColor} h-full`} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export default function KpiCards() {
  return (
    <section className="grid grid-cols-1 gap-sm sm:grid-cols-2 lg:grid-cols-4">
      {KPIS.map((kpi) => (
        <KpiTile
          key={kpi.label}
          icon={kpi.icon}
          iconBg={kpi.iconBg}
          iconColor={kpi.iconColor}
          label={kpi.label}
          value={kpi.value}
          unit={kpi.unit}
          delta={kpi.delta}
          progress={kpi.progress}
          progressColor={kpi.progressColor}
        />
      ))}

      <KpiTile
        icon="checklist"
        iconBg="bg-tertiary-container/20"
        iconColor="text-tertiary"
        label="Tâches actives"
        value="8"
        unit="/23"
        delta="3 urgentes"
      />

      <a href="#" className="block">
        <div className="relative flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm transition-shadow hover:shadow-md">
          <KpiIcon bg="bg-surface-container-high" color="text-on-surface-variant" icon="arrow_forward" />
          <div className="min-w-0 flex-1">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Prochaine étape</p>
            <p className="line-clamp-2 font-headline-sm text-[14px] font-bold leading-tight text-on-surface">
              Valider le Business Model Canvas
            </p>
          </div>
          <span className="material-symbols-outlined shrink-0 text-primary text-[18px]">
            chevron_right
          </span>
        </div>
      </a>
    </section>
  );
}
