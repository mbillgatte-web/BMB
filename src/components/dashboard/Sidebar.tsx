"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Settings, Sparkles, ChevronDown, LogOut } from "lucide-react";

import { MenuToggle } from "@/components/menuToggle/bouttonmenu";
import { cn } from "@/lib/cn";
import { useEntreprise } from "@/hooks/useEntreprise";
import { supabase } from "@/lib/supabaseClient";
import { NAV_GROUPS } from "./nav-items";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

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
      className={`flex h-full shrink-0 flex-col border-r border-outline-variant/60 bg-surface-container-lowest transition-all duration-300 hidden lg:flex ${
        isCollapsed ? "w-24" : "w-80"
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
            // Titre pur, plus aucune affordance de sélection (ni bouton ni
            // menu) : juste le nom de l'entreprise en en-tête, comme demandé.
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-container font-extrabold text-[15px] text-on-primary shadow-[0_8px_18px_-8px_rgba(70,72,212,0.55)]">
                {(entreprise?.nom ?? "B").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold leading-tight text-on-surface">
                  {entreprise?.nom ?? "Build My Business"}
                </p>
                <p className="mt-0.5 text-[12px] leading-none text-on-surface-variant/70">
                  Strategic Suite
                </p>
              </div>
            </div>
          )}

          <MenuToggle
            open={!isCollapsed}
            onOpenChange={(open) => setIsCollapsed(!open)}
            aria-label={
              isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"
            }
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
            className="rounded-lg border border-outline-variant p-1.5 text-on-surface-variant transition-colors hover:border-outline hover:bg-surface-container hover:text-on-surface"
          />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav flex-1 overflow-y-auto pr-2">
          <div className="flex flex-col gap-6">
            {NAV_GROUPS.map((group, groupIndex) => (
              <div key={group.heading ?? groupIndex} className="flex flex-col gap-1">
                {group.heading && !isCollapsed && (
                  <span className="mb-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/50">
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
                          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-[11px] transition-colors ${
                            isParentActive
                              ? "bg-primary text-on-primary shadow-[0_10px_20px_-10px_rgba(70,72,212,0.55)]"
                              : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                          } ${isCollapsed ? "justify-center px-0" : "justify-between"}`}
                          title={isCollapsed ? item.label : undefined}
                        >
                          <span className="flex items-center gap-3">
                            <Icon
                              className="h-[19px] w-[19px] shrink-0"
                              strokeWidth={1.6}
                              aria-hidden="true"
                            />
                            {!isCollapsed && (
                              <span className="text-[14.5px] font-medium">
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
                              <div className="mt-1 flex flex-col gap-1 pl-11">
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
                                      className={`rounded-lg px-3.5 py-2 text-[14px] transition-colors ${
                                        isChildActive
                                          ? "bg-primary text-on-primary font-medium"
                                          : "text-on-surface-variant/80 hover:bg-surface-container hover:text-on-surface"
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
                      className={`flex items-center gap-3 rounded-xl px-3.5 py-[11px] transition-colors ${
                        isActive
                          ? "bg-primary text-on-primary font-medium shadow-[0_10px_20px_-10px_rgba(70,72,212,0.55)]"
                          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                      } ${isCollapsed ? "justify-center px-0" : ""}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className="h-[19px] w-[19px] shrink-0"
                        strokeWidth={isActive ? 1.8 : 1.6}
                        aria-hidden="true"
                      />
                      {!isCollapsed && (
                        <span className="text-[14.5px]">{item.label}</span>
                      )}
                    </a>
                  );
                })}
              </div>
            ))}

            {/* Tout ce qui suit reste DANS le flux défilant (Settings,
                encart Pro, déconnexion) : rien n'est plus figé en bas
                pendant que le reste bouge -- c'est ce qui donnait
                l'impression d'une sidebar rigide, coupée en deux blocs qui
                ne bougeaient pas ensemble. Seul l'en-tête (logo + nom) reste
                fixe, comme le veut ce genre de panneau. */}
            <div className="flex flex-col gap-1">
              <a
                href="#"
                className={`flex items-center gap-3 rounded-xl px-3.5 py-[11px] text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
                title={isCollapsed ? "Settings" : undefined}
              >
                <Settings className="h-[19px] w-[19px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
                {!isCollapsed && <span className="text-[14.5px]">Settings</span>}
              </a>
            </div>

            {/* Encart Pro (seul aplat sombre de l'écran -- voir l'aperçu
                "Indigo Clair" validé avant cette implémentation) et
                déconnexion, au même gabarit de bouton (rounded-xl, py-3,
                font-bold) pour un poids visuel comparable -- seule la
                couleur change pour distinguer une action de vente d'une
                action sensible. Boutons en dur (pas <Button>) : le composant
                partagé est pensé pour un remplissage progressif au hover,
                alors que ces deux pastilles doivent être pleines d'emblée --
                même logique que les boutons faits main d'AIRecommendation.tsx. */}
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  "flex flex-col gap-3 rounded-2xl bg-[linear-gradient(160deg,#101223_0%,#181A30_55%,#20223D_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
                  isCollapsed ? "p-2.5" : "p-4"
                )}
              >
                {!isCollapsed && (
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-white">
                      Passez à l&apos;offre Pro
                    </span>
                    <span className="text-[11.5px] text-white/50">
                      IA illimitée, exports, projets illimités
                    </span>
                  </div>
                )}
                {/* Même mécanique que le composant <Button> partagé (voir
                    ui/Button.tsx : SHELL + CIRCLE) -- reproduite à la main
                    ici parce que son cercle de remplissage est câblé en dur
                    sur bg-primary, alors que ces deux boutons ont chacun
                    leur propre couleur de remplissage (indigo ici, noir pour
                    la déconnexion juste en dessous). */}
                <button
                  type="button"
                  title="Passer à la version Pro"
                  aria-label={isCollapsed ? "Passer à la version Pro" : undefined}
                  className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-[100px] border-[1.5px] border-white/20 bg-transparent px-3.5 py-3 text-[14px] font-bold text-white transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-xl hover:border-transparent active:scale-[0.97]"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-gradient-to-br from-primary to-primary-container opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100"
                  />
                  <span className="relative z-10 flex items-center gap-2">
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
                className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-[100px] border-[1.5px] border-outline-variant bg-transparent px-3.5 py-3 text-[14px] font-bold text-on-surface-variant transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-xl hover:border-transparent hover:text-white active:scale-[0.97]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-[#101223] opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100"
                />
                <span className="relative z-10 flex items-center gap-2">
                  <LogOut className="h-[16px] w-[16px] shrink-0" aria-hidden="true" />
                  {!isCollapsed && "Se déconnecter"}
                </span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
