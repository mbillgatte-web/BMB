"use client";

import { useState } from "react";

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-surface border-r border-outline-variant h-screen flex-col hidden lg:flex sticky top-0 left-0 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
      id="sidebar"
    >
      <div className="flex flex-col h-full py-lg px-md">
        <div
          className={`flex items-center pb-8 ${
            isCollapsed ? "justify-center" : "justify-between gap-3 px-4"
          }`}
        >
          
          {!isCollapsed && <div className="min-w-0">
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              Build My Business
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Strategic Suite
            </p>
          </div>}
          <button
            type="button"
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors"
            aria-label={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
          >
            <span className="material-symbols-outlined">
              {isCollapsed ? "keyboard_double_arrow_right" : "keyboard_double_arrow_left"}
            </span>
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href="#"
              className={`${
                item.active
                  ? "flex items-center gap-3 px-4 py-3 text-primary bg-primary-container/10 border-r-4 border-primary rounded-l-lg transition-transform duration-150"
                  : "flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all rounded-lg"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
              title={isCollapsed ? item.label : undefined}
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
              {!isCollapsed && <span className="font-label-md text-label-md">{item.label}</span>}
            </a>
          ))}

          <a
            href="#"
            className={`flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all rounded-lg mt-auto ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <span className="material-symbols-outlined">settings</span>
            {!isCollapsed && <span className="font-label-md text-label-md">Settings</span>}
          </a>
        </nav>

        <div className="mt-8 pt-4 border-t border-outline-variant">
          <button
            className={`w-full py-3 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 ${
              isCollapsed ? "px-0" : ""
            }`}
            title={isCollapsed ? "Upgrade to Pro" : undefined}
          >
            <span className="material-symbols-outlined text-[18px]">upgrade</span>
            {!isCollapsed && "Upgrade to Pro"}
          </button>
        </div>
      </div>
    </aside>
  );
}
