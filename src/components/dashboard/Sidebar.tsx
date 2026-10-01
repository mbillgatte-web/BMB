"use client";

import { useState } from "react";

import { MenuToggle } from "@/components/menuToggle/bouttonmenu";
import { cn } from "@/lib/cn";
import EntrepriseSwitcher from "./EntrepriseSwitcher";
import SidebarContent from "./SidebarContent";

/**
 * Barre latérale bureau (≥ lg). Son contenu (liens, encart Pro,
 * déconnexion) vit dans SidebarContent.tsx, partagé avec le tiroir mobile
 * (MobileNavDrawer.tsx) ouvert depuis TopNav.tsx sous lg.
 */
export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        // Fond légèrement teinté et bordure nette : la barre se distingue
        // du panneau de contenu sans passer par un dégradé.
        "hidden h-full shrink-0 flex-col border-r border-outline-variant bg-surface-container-low transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] lg:flex",
        isCollapsed ? "w-[88px]" : "w-72"
      )}
      id="sidebar"
    >
      <div className="flex h-full flex-col px-md py-lg">
        {/* En-tête : sélecteur d'entreprise + repli */}
        <div
          className={cn(
            "flex items-center pb-6",
            isCollapsed ? "flex-col gap-3" : "justify-between gap-2 px-0.5"
          )}
        >
          <EntrepriseSwitcher collapsed={isCollapsed} />

          <MenuToggle
            open={!isCollapsed}
            onOpenChange={(open) => setIsCollapsed(!open)}
            aria-label={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            className="shrink-0 rounded-lg border border-outline-variant p-1.5 text-on-surface-variant transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          />
        </div>

        {/* Navigation */}
        <SidebarContent collapsed={isCollapsed} layoutGroupId="sidebar" />
      </div>
    </aside>
  );
}
