"use client";
import { useState } from "react";

import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Folder,
  BrainCircuit,
  ListChecks,
  ClipboardList,
  FileText,
  ChartNoAxesCombined,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
  LayoutTemplate,
  ImagePlus,
  LucideIcon,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useEntreprise } from "@/hooks/useEntreprise";

type NavChild = {
  label: string;
  link: string;
};

type NavItem = {
  icon: LucideIcon;
  label: string;
  link?: string;
  children?: NavChild[];
};


const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", link: "/dashboard" },
  { icon: Folder, label: "Projects" },
  { icon: BrainCircuit, label: "Etude de faisabilité" },
  { icon: ListChecks, label: "Business Plan" },
  { icon: ClipboardList, label: "Taches" },
  { icon: FileText, label: "Livrables " },
  { icon: ChartNoAxesCombined, label: "Demarche administrative" },
  {
  icon: Folder,
  label: "Identité visuelle",
  children: [
    { label: "Palette de couleurs", link: "/PaletteColor" },
    { label: "Typographie", link: "/Typographie" },
    { label: "Logo", link: "/Logo" },
  ],
},
  { icon: LayoutTemplate, label: "Mon site web", link: "/Templates" },
  { icon: ImagePlus, label: "Visuels marketing", link: "/Visuels" },

];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  
  const pathname = usePathname();

  const { entreprise, entreprises, selectEntreprise } = useEntreprise();

  const [isEntrepriseMenuOpen, setIsEntrepriseMenuOpen] = useState(false);

  // Le label du parent dont un enfant correspond à la page actuelle (ex:
  // "Identité visuelle" quand pathname === "/Logo"), ou null sinon. Pure
  // dérivation à partir de NAV_ITEMS + pathname : pas besoin d'un effet.
  
  const activeParentLabel =
    NAV_ITEMS.find((item) =>
      item.children?.some((child) => child.link === pathname)
    )?.label ?? null;

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenMenu(activeParentLabel);
  }




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
          <div className="relative min-w-0">
            <button
              type="button"
              onClick={() => setIsEntrepriseMenuOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-2 text-left"
            >
              <div className="min-w-0">
                <h1 className="truncate font-headline-md text-headline-md font-bold text-primary">
                  {entreprise?.nom ?? "Build My Business"}
                </h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Strategic Suite
                </p>
              </div>
              {entreprises.length > 1 && (
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-on-surface-variant transition-transform duration-200 ${
                    isEntrepriseMenuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              )}
            </button>

            {isEntrepriseMenuOpen && entreprises.length > 1 && (
              <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-outline-variant bg-surface p-1 shadow-lg">
                {entreprises.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => {
                      selectEntreprise(e.id);
                      setIsEntrepriseMenuOpen(false);
                    }}
                    className={`w-full truncate rounded-lg px-3 py-2 text-left font-label-md text-label-md transition-colors ${
                      e.id === entreprise?.id
                        ? "bg-primary/10 font-semibold text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                    }`}
                  >
                    {e.nom}
                  </button>
                ))}
              </div>
            )}
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

            // Cas 1 : l'item a des sous-liens (ex: "Identité visuelle")
            if (item.children) {
              const isOpen = openMenu === item.label;
              const isParentActive = item.children.some((child) => child.link === pathname);


              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu((current) => (current === item.label ? null : item.label))
                    }
                    aria-expanded={isOpen}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                      isParentActive
                        ? "font-semibold text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                    } ${isCollapsed ? "justify-center px-0" : "justify-between"}`}

                    title={isCollapsed ? item.label : undefined}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-5 w-5 shrink-0" size={20} strokeWidth={1.8} aria-hidden="true" />
                      {!isCollapsed && (
                        <span className="font-label-md text-label-md">{item.label}</span>
                      )}
                    </span>

                    {!isCollapsed && (
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    )}
                  </button>

                  {!isCollapsed && isOpen && (
                    <div className="mt-1 flex flex-col gap-1 pl-11">
                     {item.children.map((child) => {
                        const isChildActive = child.link === pathname;

                        // On précise l'entreprise dans l'URL quand on la
                        // connaît (voir useEntrepriseId.ts) ; sinon on laisse
                        // le lien nu, qui retombera sur la détection auto.
                        const href = entreprise
                          ? `${child.link}?entrepriseId=${entreprise.id}`
                          : child.link;

                        return (
                          <a
                            key={child.label}
                            href={href}
                            className={`rounded-lg px-3 py-2 font-label-md text-label-md transition-colors ${
                              isChildActive
                                ? "bg-primary/10 font-semibold text-primary"
                                : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary"
                            }`}
                          >
                            {child.label}
                          </a>
                        );
                      })}

                    </div>
                  )}
                </div>
              );
            }

            // Cas 2 : item simple, inchangé par rapport à avant

            const isActive = item.link === pathname;

            return (
              <a
                key={item.label}
                href={item.link ?? "#"}
                className={`${
                  isActive
                    ? "relative flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 font-semibold text-primary shadow-sm before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-primary"
                    : "flex items-center gap-3 rounded-xl px-4 py-3 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                } ${isCollapsed ? "justify-center px-0" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`}
                  size={20}
                  strokeWidth={isActive ? 2.4 : 1.8}
                  aria-hidden="true"
                />

                {!isCollapsed && (
                  <span className="font-label-md text-label-md">{item.label}</span>
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
