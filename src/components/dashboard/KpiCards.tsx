const KPIS = [
  {
    label: "Indice de maturité",
    icon: "trending_up",
    iconBg: "bg-primary-container/20",
    iconColor: "text-primary",
    value: "62",
    unit: "/100",
    progress: 62,
    progressColor: "bg-primary",
  },
  {
    label: "Avancement",
    icon: "flag",
    iconBg: "bg-secondary-container/30",
    iconColor: "text-secondary",
    value: "34",
    unit: "%",
    progress: 34,
    progressColor: "bg-secondary",
  },
];

export default function KpiCards() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
      {KPIS.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-label-md text-label-md text-on-surface-variant">
              {kpi.label}
            </h3>
            <div
              className={`w-8 h-8 rounded-full ${kpi.iconBg} flex items-center justify-center`}
            >
              <span className={`material-symbols-outlined ${kpi.iconColor} text-[18px]`}>
                {kpi.icon}
              </span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono-stats text-[32px] font-bold text-on-surface">
              {kpi.value}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {kpi.unit}
            </span>
          </div>
          <div className="mt-4 w-full bg-surface-container-high rounded-full h-2">
            <div
              className={`${kpi.progressColor} h-2 rounded-full`}
              style={{ width: `${kpi.progress}%` }}
            ></div>
          </div>
        </div>
      ))}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-label-md text-label-md text-on-surface-variant">
            Tâches actives
          </h3>
          <div className="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-[18px]">
              checklist
            </span>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono-stats text-[32px] font-bold text-on-surface">8</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">/23</span>
        </div>
        <p className="mt-4 font-body-sm text-body-sm text-tertiary">
          3 urgentes aujourd&apos;hui
        </p>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-label-md text-label-md text-on-surface-variant">
            Prochaine étape
          </h3>
          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
              arrow_forward
            </span>
          </div>
        </div>
        <h4 className="font-headline-md text-body-lg font-bold text-on-surface line-clamp-2 mt-2">
          Valider le Business Model Canvas
        </h4>
        <button className="mt-2 text-primary font-label-md text-label-md hover:underline flex items-center gap-1">
          Commencer <span className="material-symbols-outlined text-[16px]">chevron_right</span>
        </button>
      </div>
    </section>
  );
}
