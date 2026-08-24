const NAV_ITEMS = [
  { icon: "dashboard", label: "Overview", active: true },
  { icon: "folder", label: "Projects" },
  { icon: "psychology", label: "AI Diagnostic" },
  { icon: "smart_toy", label: "AI Assistant" },
  { icon: "timeline", label: "Action Plan" },
  { icon: "assignment", label: "Tasks" },
  { icon: "description", label: "Documents" },
  { icon: "analytics", label: "Market Validation" },
];

export default function Sidebar() {
  return (
    <aside
      className="bg-surface border-r border-outline-variant h-screen w-72 flex-col hidden lg:flex sticky top-0 left-0 transition-all duration-300"
      id="sidebar"
    >
      <div className="flex flex-col h-full py-lg px-md">
        <div className="flex items-center gap-3 px-4 pb-8">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-md">
            AI
          </div>
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              AI Business Builder
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Strategic Suite
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              className={
                item.active
                  ? "flex items-center gap-3 px-4 py-3 text-primary bg-primary-container/10 border-r-4 border-primary rounded-l-lg transition-transform duration-150"
                  : "flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all rounded-lg"
              }
            >
              <span
                className={
                  item.active
                    ? "material-symbols-outlined fill-1"
                    : "material-symbols-outlined"
                }
              >
                {item.icon}
              </span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </a>
          ))}

          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all rounded-lg mt-auto"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="font-label-md text-label-md">Settings</span>
          </a>
        </nav>

        <div className="mt-8 pt-4 border-t border-outline-variant">
          <button className="w-full py-3 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">upgrade</span>
            Upgrade to Pro
          </button>
        </div>
      </div>
    </aside>
  );
}
