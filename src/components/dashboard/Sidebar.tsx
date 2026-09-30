"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { Settings, Sparkles, ChevronDown, LogOut, type LucideIcon } from "lucide-react";

import { MenuToggle } from "@/components/menuToggle/bouttonmenu";
import { cn } from "@/lib/cn";
import { useEntreprise } from "@/hooks/useEntreprise";
import { supabase } from "@/lib/supabase/browser";
import { NAV_GROUPS } from "./nav-items";
import EntrepriseSwitcher from "./EntrepriseSwitcher";

// Surlignage qui suit la souris d'un lien à l'autre (un seul élément animé
// via layoutId, plutôt qu'un fond qui clignote sur chaque lien).
const RESSORT = { type: "spring", stiffness: 500, damping: 38 } as const;

const ITEM =
  "group relative flex w-full items-center gap-3 rounded-xl px-3.5 py-[11px] text-[14.5px] " +
  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40";

function SurvolPill({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.span
      layoutId="sidebar-survol"
      transition={RESSORT}
      className="absolute inset-0 rounded-xl bg-surface-container"
      aria-hidden="true"
    />
  );
}

function ItemIcon({ icon: Icon, active }: { icon: LucideIcon; active?: boolean }) {
  return (
    <Icon
      className="h-[19px] w-[19px] shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110"
      strokeWidth={active ? 1.9 : 1.6}
      aria-hidden="true"
    />
  );
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [survol, setSurvol] = useState<string | null>(null);

  const pathname = usePathname();

  const { entreprise } = useEntreprise();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Le label du parent dont un enfant correspond à la page actuelle (ex:
  // "Identité visuelle" quand pathname === "/Logo"), ou null sinon. Pure
  // dérivation à partir de NAV_GROUPS + pathname : pas besoin d'un effet.
  const activeParentLabel =
    NAV_GROUPS.flatMap((group) => group.items).find((item) =>
      item.children?.some((child) => child.link === pathname)
    )?.label ?? null;

  // Ouvert d'emblée sur une sous-page (ex: /Logo ouvre "Identité visuelle").
  const [openMenu, setOpenMenu] = useState<string | null>(activeParentLabel);

  // Technique de rendu (pas d'effet) pour ouvrir automatiquement le bon
  // sous-menu à la navigation, sans empêcher une fermeture manuelle
  // ensuite (voir les hooks du dossier src/hooks pour le même principe).
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenMenu(activeParentLabel);
  }

  // On précise l'entreprise dans l'URL quand on la connaît (voir
  // useEntrepriseId.ts) ; sinon le lien nu retombe sur la détection auto.
  const withEntreprise = (link: string) =>
    entreprise ? `${link}?entrepriseId=${entreprise.id}` : link;

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-outline-variant/60 bg-surface-container-lowest transition-[width] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] lg:flex",
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
        <LayoutGroup id="sidebar">
          <nav
            aria-label="Navigation principale"
            className="sidebar-nav -mr-2 flex-1 overflow-y-auto pr-2"
            onMouseLeave={() => setSurvol(null)}
          >
            <div className="flex flex-col gap-6">
              {NAV_GROUPS.map((group, groupIndex) => (
                <div key={group.heading ?? groupIndex} className="flex flex-col gap-1">
                  {group.heading &&
                    (isCollapsed ? (
                      <span className="mx-auto mb-1.5 h-px w-8 bg-outline-variant" aria-hidden="true" />
                    ) : (
                      <span className="mb-1.5 px-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50">
                        {group.heading}
                      </span>
                    ))}

                  {group.items.map((item) => {
                    // Cas 1 : l'item a des sous-liens (ex: "Identité visuelle")
                    if (item.children) {
                      const isOpen = openMenu === item.label && !isCollapsed;
                      const isParentActive = item.children.some((child) => child.link === pathname);

                      return (
                        <div key={item.label}>
                          <button
                            type="button"
                            onClick={() =>
                              isCollapsed
                                ? router.push(withEntreprise(item.children![0].link))
                                : setOpenMenu((current) => (current === item.label ? null : item.label))
                            }
                            onMouseEnter={() => setSurvol(item.label)}
                            aria-expanded={isCollapsed ? undefined : isOpen}
                            title={isCollapsed ? item.label : undefined}
                            className={cn(
                              ITEM,
                              "cursor-pointer",
                              isCollapsed ? "justify-center px-0" : "justify-between",
                              isParentActive
                                ? isCollapsed
                                  ? "bg-primary text-on-primary shadow-[0_10px_20px_-10px_rgba(70,72,212,0.55)]"
                                  : "bg-primary/10 font-semibold text-primary"
                                : "text-on-surface-variant hover:text-on-surface"
                            )}
                          >
                            <SurvolPill visible={survol === item.label && !isParentActive} />
                            <span className="relative z-10 flex items-center gap-3">
                              <ItemIcon icon={item.icon} active={isParentActive} />
                              {!isCollapsed && <span className="font-medium">{item.label}</span>}
                            </span>

                            {!isCollapsed && (
                              <ChevronDown
                                className={cn(
                                  "relative z-10 h-3.5 w-3.5 shrink-0 transition-transform duration-300",
                                  isOpen && "rotate-180"
                                )}
                                aria-hidden="true"
                              />
                            )}
                          </button>

                          {!isCollapsed && (
                            <div
                              className={cn(
                                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                              )}
                            >
                              <div className="overflow-hidden">
                                {/* Fil vertical qui relie les sous-liens à leur parent. */}
                                <ul className="relative ml-[25px] mt-1 flex flex-col gap-0.5 border-l-2 border-outline-variant/70 py-0.5 pl-3">
                                  {item.children.map((child) => {
                                    const isChildActive = child.link === pathname;
                                    const cle = `${item.label}/${child.label}`;

                                    return (
                                      <li key={child.label} className="relative">
                                        {/* Repère sur le fil, violet pour la page actuelle. */}
                                        <span
                                          aria-hidden="true"
                                          className={cn(
                                            "absolute -left-[17px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-surface-container-lowest transition-colors duration-200",
                                            isChildActive ? "bg-primary" : "bg-outline-variant"
                                          )}
                                        />
                                        <Link
                                          href={withEntreprise(child.link)}
                                          tabIndex={isOpen ? undefined : -1}
                                          aria-current={isChildActive ? "page" : undefined}
                                          onMouseEnter={() => setSurvol(cle)}
                                          className={cn(
                                            "relative flex rounded-lg px-3 py-2 text-[14px] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                                            isChildActive
                                              ? "bg-primary font-medium text-on-primary shadow-[0_8px_16px_-10px_rgba(70,72,212,0.6)]"
                                              : "text-on-surface-variant/80 hover:text-on-surface"
                                          )}
                                        >
                                          <SurvolPill visible={survol === cle && !isChildActive} />
                                          <span className="relative z-10">{child.label}</span>
                                        </Link>
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Cas 2 : item simple
                    const isActive = item.link === pathname;

                    return (
                      <Link
                        key={item.label}
                        href={item.link ?? "#"}
                        aria-current={isActive ? "page" : undefined}
                        onMouseEnter={() => setSurvol(item.label)}
                        title={isCollapsed ? item.label : undefined}
                        className={cn(
                          ITEM,
                          isCollapsed && "justify-center px-0",
                          isActive
                            ? "bg-primary font-medium text-on-primary shadow-[0_10px_20px_-10px_rgba(70,72,212,0.55)]"
                            : "text-on-surface-variant hover:text-on-surface"
                        )}
                      >
                        <SurvolPill visible={survol === item.label && !isActive} />
                        <span className="relative z-10 flex min-w-0 items-center gap-3">
                          <ItemIcon icon={item.icon} active={isActive} />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ))}

              {/* Tout ce qui suit reste DANS le flux défilant (paramètres,
                  encart Pro, déconnexion) : rien n'est figé en bas pendant
                  que le reste bouge. Seul l'en-tête reste fixe. */}
              <div className="flex flex-col gap-1 border-t border-outline-variant/60 pt-4">
                <Link
                  href="#"
                  onMouseEnter={() => setSurvol("parametres")}
                  title={isCollapsed ? "Paramètres" : undefined}
                  className={cn(ITEM, "text-on-surface-variant hover:text-on-surface", isCollapsed && "justify-center px-0")}
                >
                  <SurvolPill visible={survol === "parametres"} />
                  <span className="relative z-10 flex items-center gap-3">
                    <ItemIcon icon={Settings} />
                    {!isCollapsed && <span>Paramètres</span>}
                  </span>
                </Link>
              </div>

              {/* Encart Pro et déconnexion : mêmes pastilles à remplissage
                  que le composant <Button> partagé (voir ui/Button.tsx),
                  reproduites ici pour leurs couleurs propres. */}
              <div className="flex flex-col gap-2">
                <div
                  className={cn(
                    "relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#3739B7_0%,#4648D4_55%,#6063EE_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.16),0_16px_32px_-20px_rgba(70,72,212,0.8)]",
                    isCollapsed ? "p-2.5" : "p-4"
                  )}
                >
                  {/* Reflet décoratif dans le coin. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full border border-white/15"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-2 -top-4 h-14 w-14 rounded-full border border-white/10"
                  />

                  {!isCollapsed && (
                    <div className="relative flex flex-col gap-1">
                      <span className="text-[14px] font-bold text-white">Passez à l&apos;offre Pro</span>
                      <span className="text-[12px] leading-snug text-white/85">
                        IA illimitée, exports, projets illimités
                      </span>
                    </div>
                  )}
                  <button
                    type="button"
                    title="Passer à la version Pro"
                    aria-label={isCollapsed ? "Passer à la version Pro" : undefined}
                    className="group relative flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[100px] border-[1.5px] border-white/25 bg-white/10 px-3.5 py-3 text-[14px] font-bold text-white transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-xl hover:border-transparent active:scale-[0.97]"
                  >
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100"
                    />
                    <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-primary">
                      <Sparkles className="h-[16px] w-[16px] shrink-0" aria-hidden="true" />
                      {!isCollapsed && "Passer à Pro"}
                    </span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Se déconnecter"
                  aria-label={isCollapsed ? "Se déconnecter" : undefined}
                  className="group relative flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[100px] border-[1.5px] border-outline-variant bg-transparent px-3.5 py-3 text-[14px] font-bold text-on-surface-variant transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-xl hover:border-transparent hover:text-white active:scale-[0.97]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-primary opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100"
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    <LogOut className="h-[16px] w-[16px] shrink-0 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true" />
                    {!isCollapsed && "Se déconnecter"}
                  </span>
                </button>
              </div>
            </div>
          </nav>
        </LayoutGroup>
      </div>
    </aside>
  );
}
