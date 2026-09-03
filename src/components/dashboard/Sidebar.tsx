"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";

import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useEntreprise } from "@/hooks/useEntreprise";
import { NAV_GROUPS } from "./nav-items";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const pathname = usePathname();

  const { entreprise, entreprises, selectEntreprise } = useEntreprise();
  const [isEntrepriseMenuOpen, setIsEntrepriseMenuOpen] = useState(false);

  // Le label du parent dont un enfant correspond à la page actuelle (ex:
  // "Identité visuelle" quand pathname === "/Logo"), ou null sinon. Pure
  // dérivation à partir de NAV_GROUPS + pathname : pas besoin d'un effet.
  const activeParentLabel =
    NAV_GROUPS.flatMap((group) => group.items).find((item) =>
      item.children?.some((child) => child.link === pathname)
    )?.label ?? null;

  // Technique de rendu (pas d'effet) pour ouvrir automatiquement le bon
  // sous-menu à la navigation, sans empêcher une fermeture manuelle
  // ensuite (voir les hooks du dossier src/hooks pour le même principe).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenMenu(activeParentLabel);
  }

  return (
    <aside
      className={`flex h-screen shrink-0 flex-col border-r border-white/10 bg-zinc-950 shadow-[8px_0_24px_rgba(0,0,0,0.25)] transition-all duration-300 hidden lg:flex sticky top-0 left-0 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
      id="sidebar"
    >
      <div className="flex h-full flex-col px-md py-lg">
        {/* En-tête : sélecteur d'entreprise + repli */}
        <div
          className={`flex items-center pb-8 ${
            isCollapsed ? "justify-center" : "justify-between gap-3 px-2"
          }`}
        >
          {!isCollapsed && (
            <div className="relative min-w-0">
              <button
                type="button"
                onClick={() => setIsEntrepriseMenuOpen((open) => !open)}
                className="flex w-full items-center gap-2.5 rounded-lg py-1 text-left transition-colors hover:bg-white/5"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[6px] bg-primary font-semibold text-[13px] text-white shadow-sm">
                  {(entreprise?.nom ?? "B").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium leading-none text-zinc-100">
                    {entreprise?.nom ?? "Build My Business"}
                  </p>
                  <p className="mt-1 text-[11px] leading-none text-zinc-500">
                    Strategic Suite
                  </p>
                </div>
                {entreprises.length > 1 && (
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform duration-200 ${
                      isEntrepriseMenuOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                )}
              </button>

              {isEntrepriseMenuOpen && entreprises.length > 1 && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsEntrepriseMenuOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-20 mt-2 w-full rounded-xl border border-white/10 bg-zinc-900 p-1 shadow-xl">
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
                            ? "bg-primary/15 font-semibold text-primary"
                            : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                        }`}
                      >
                        {e.nom}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed((collapsed) => !collapsed)}
            aria-label={
              isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"
            }
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            className="rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-100"
          >
            {isCollapsed ? (
              <PanelLeftOpen size={20} aria-hidden="true" />
            ) : (
              <PanelLeftClose size={20} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col gap-5">
            {NAV_GROUPS.map((group, groupIndex) => (
              <div key={group.heading ?? groupIndex} className="flex flex-col gap-0.5">
                {group.heading && !isCollapsed && (
                  <span className="mb-1 px-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    {group.heading}
                  </span>
                )}

                {group.items.map((item) => {
                  const Icon = item.icon;

                  // Cas 1 : l'item a des sous-liens (ex: "Identité visuelle")
                  if (item.children) {
                    const isOpen = openMenu === item.label;
                    const isParentActive = item.children.some(
                      (child) => child.link === pathname
                    );

                    return (
                      <div key={item.label}>
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu((current) =>
                              current === item.label ? null : item.label
                            )
                          }
                          aria-expanded={isOpen}
                          className={`flex w-full items-center gap-2.5 rounded-[6px] px-2.5 py-[7px] transition-colors ${
                            isParentActive
                              ? "bg-primary/15 font-medium text-primary"
                              : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                          } ${isCollapsed ? "justify-center px-0" : "justify-between"}`}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon
                              className="h-4 w-4 shrink-0"
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />
                            {!isCollapsed && (
                              <span className="text-[13px] tracking-wide">
                                {item.label}
                              </span>
                            )}
                          </span>

                          {!isCollapsed && (
                            <ChevronDown
                              className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              aria-hidden="true"
                            />
                          )}
                        </button>

                        {!isCollapsed && (
                          <div
                            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                              isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="mt-0.5 flex flex-col gap-0.5 pl-9">
                                {item.children.map((child) => {
                                  const isChildActive = child.link === pathname;

                                  // On précise l'entreprise dans l'URL quand on
                                  // la connaît (voir useEntrepriseId.ts) ; sinon
                                  // le lien nu retombe sur la détection auto.
                                  const href = entreprise
                                    ? `${child.link}?entrepriseId=${entreprise.id}`
                                    : child.link;

                                  return (
                                    <a
                                      key={child.label}
                                      href={href}
                                      className={`rounded-[6px] px-2.5 py-[7px] text-[13px] transition-colors ${
                                        isChildActive
                                          ? "bg-primary/15 font-medium text-primary"
                                          : "text-zinc-500 hover:bg-white/5 hover:text-zinc-100"
                                      }`}
                                    >
                                      {child.label}
                                    </a>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Cas 2 : item simple
                  const isActive = item.link === pathname;

                  return (
                    <a
                      key={item.label}
                      href={item.link ?? "#"}
                      className={`flex items-center gap-2.5 rounded-[6px] px-2.5 py-[7px] transition-colors ${
                        isActive
                          ? "relative bg-primary/15 font-medium text-primary before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-primary"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        strokeWidth={isActive ? 2 : 1.5}
                        aria-hidden="true"
                      />
                      {!isCollapsed && (
                        <span className="text-[13px] tracking-wide">{item.label}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        {/* Bas de sidebar : réglages + upsell */}
        <div className="mt-4 flex flex-col gap-0.5 border-t border-white/10 pt-4">
          <a
            href="#"
            className={`flex items-center gap-2.5 rounded-[6px] px-2.5 py-[7px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100 ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
            title={isCollapsed ? "Settings" : undefined}
          >
            <Settings className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden="true" />
            {!isCollapsed && <span className="text-[13px] tracking-wide">Settings</span>}
          </a>

          <div className="mt-3">
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
      </div>
    </aside>
  );
}
