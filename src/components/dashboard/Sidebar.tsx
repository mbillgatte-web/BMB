"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Folder,
  BrainCircuit,
  Bot,
  ListChecks,
  ClipboardList,
  FileText,
  ChartNoAxesCombined,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Overview", active: true, link: "/dashboard" },
  { icon: Folder, label: "Projects" },
  { icon: BrainCircuit, label: "Etude de faisabilité" },
  { icon: ListChecks, label: "Business Plan" },
  { icon: ClipboardList, label: "Taches" },
  { icon: FileText, label: "Livrables " },
  { icon: ChartNoAxesCombined, label: "Demarche administrative" },
  { icon: Folder, label: "Identité visuelle", link: "/PaletteColor" },
  {icon: Folder, label: "Typographie", link: "/Typographie"},
  {icon: Folder, label: "Logo", link: "/Logo"},
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`bg-surface  border-r border-outline-variant h-screen flex-col hidden lg:flex shrink-0 sticky top-0 left-0 rounded-r-2xl shadow-[8px_0_24px_rgba(27,27,35,0.06)] transition-all duration-300 ${
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
          {!isCollapsed && (
            <div className="min-w-0">
              <h1 className="font-headline-md text-headline-md font-bold text-primary">
                Build My Business
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Strategic Suite
              </p>
            </div>
          )}
          <Button
            variant="icon"
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            aria-label={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={20} aria-hidden="true" />
            )}
          </Button>
        </div>

        <nav className="sidebar-nav flex-1 space-y-2 overflow-y-auto pr-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.label}
                href={item.link ?? "#"}
                className={`${
                  item.active
                    ? "relative flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 font-semibold text-primary shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary"
                    : "flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${item.active ? "text-primary" : ""}`}
                  size={20}
                  strokeWidth={item.active ? 2.4 : 1.8}
                  aria-hidden="true"
                />

                {!isCollapsed && (
                  <span className="font-label-md text-label-md">
                    {item.label}
                  </span>
                )}
              </a>
            );
          })}

          <a
            href="#"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-all mt-auto ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-5 w-5 shrink-0" size={20} aria-hidden="true" />
            {!isCollapsed && <span className="font-label-md text-label-md">Settings</span>}
          </a>
        </nav>

        <div className="mt-8 pt-4 border-t border-outline-variant">
          <Button
            arrows={false}
            size={isCollapsed ? "sm" : "md"}
            className={cn("w-full", isCollapsed && "px-0")}
            title="Passer à la version Pro"
            aria-label={isCollapsed ? "Passer à la version Pro" : undefined}
          >
            <Sparkles className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!isCollapsed && "Passer à Pro"}
          </Button>
        </div>
      </div>
    </aside>
  );
}
