"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { CaretDown, Crown, GearSix, SignOut } from "@phosphor-icons/react";

import { cn } from "@/lib/cn";
import { useEntreprise } from "@/hooks/useEntreprise";
import { supabase } from "@/lib/supabase/browser";
import { NAV_GROUPS, type NavIcon } from "./nav-items";

// Surlignage qui suit la souris d'un lien à l'autre (un seul élément animé
// via layoutId, plutôt qu'un fond qui clignote sur chaque lien).
const RESSORT = { type: "spring", stiffness: 500, damping: 38 } as const;

// Libellés en couleur de texte principal, 14 px medium : la sidebar doit se
// lire aussi nettement que le contenu, pas en gris clair.
const ITEM =
  "group relative flex w-full min-h-10 items-center gap-3 rounded-xl px-3.5 py-[11px] text-[14px] font-medium leading-5 " +
  "transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60";

const ITEM_INACTIF = "text-on-surface hover:text-primary";

// Style de l'item « bientôt » : même gabarit, même couleur de texte, mais
// sans survol ni curseur main.
const ITEM_BIENTOT = "cursor-default text-on-surface";

function SurvolPill({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <motion.span
      layoutId="sidebar-survol"
      transition={RESSORT}
      className="absolute inset-0 rounded-xl bg-surface-container-high"
      aria-hidden="true"
    />
  );
}

// Icône Phosphor : « duotone » au repos (deux tons de la couleur courante),
// « fill » sur la page en cours. Hors page active, elle prend le vert au
// survol avec le libellé.
function ItemIcon({
  icon: Icon,
  active,
  size = 20,
  survolable = true,
}: {
  icon: NavIcon;
  active?: boolean;
  size?: number;
  survolable?: boolean;
}) {
  return (
    <Icon
      size={size}
      weight={active ? "fill" : "duotone"}
      className={cn(
        "shrink-0 transition-[transform,color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110",
        !active && survolable && "text-on-surface group-hover:text-primary"
      )}
      aria-hidden="true"
    />
  );
}

// Item visible mais pas encore branché (pas de lien dans nav-items.ts) :
// non cliquable, non focusable, libellé complet. Libellé et icône restent
// sombres pour rester lisibles.
function ItemBientot({
  icon,
  label,
  collapsed,
}: {
  icon: NavIcon;
  label: string;
  collapsed: boolean;
}) {
  return (
    <span
      aria-disabled="true"
      title={collapsed ? label : undefined}
      className={cn(ITEM, ITEM_BIENTOT, collapsed && "justify-center px-0")}
    >
      <span className="flex items-center gap-3">
        <ItemIcon icon={icon} survolable={false} />
        {!collapsed && <span>{label}</span>}
      </span>
    </span>
  );
}

type SidebarContentProps = {
  /** Barre repliée (icônes seules) : uniquement sur bureau, voir Sidebar.tsx. */
  collapsed: boolean;
  /**
   * Identifiant du LayoutGroup framer-motion : la sidebar bureau et le tiroir
   * mobile (MobileNavDrawer.tsx) montent le même contenu, chacun avec son
   * propre groupe pour que la pastille de survol ne saute pas de l'un à l'autre.
   */
  layoutGroupId: string;
  /** Appelé après un clic sur un lien : le tiroir mobile s'en sert pour se fermer. */
  onNavigate?: () => void;
};

/**
 * Navigation du dashboard (liens, sous-menus, Paramètres, encart Pro,
 * déconnexion), partagée telle quelle par la Sidebar bureau et par le tiroir
 * mobile. Les items viennent de NAV_GROUPS (nav-items.ts), seule source.
 */
export default function SidebarContent({ collapsed, layoutGroupId, onNavigate }: SidebarContentProps) {
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
    <LayoutGroup id={layoutGroupId}>
      <nav
        aria-label="Navigation principale"
        className="sidebar-nav -mr-2 flex-1 overflow-y-auto pr-2"
        onMouseLeave={() => setSurvol(null)}
      >
        <div className="flex flex-col gap-6">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={group.heading ?? groupIndex} className="flex flex-col gap-1">
              {group.heading &&
                (collapsed ? (
                  <span className="mx-auto mb-1.5 h-px w-8 bg-outline-variant" aria-hidden="true" />
                ) : (
                  <span className="mb-1.5 px-3.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {group.heading}
                  </span>
                ))}

              {group.items.map((item) => {
                // Cas 1 : l'item a des sous-liens (ex: "Identité visuelle")
                if (item.children) {
                  const isOpen = openMenu === item.label && !collapsed;
                  const isParentActive = item.children.some((child) => child.link === pathname);

                  return (
                    <div key={item.label}>
                      <button
                        type="button"
                        onClick={() => {
                          if (collapsed) {
                            router.push(withEntreprise(item.children![0].link));
                            onNavigate?.();
                          } else {
                            setOpenMenu((current) => (current === item.label ? null : item.label));
                          }
                        }}
                        onMouseEnter={() => setSurvol(item.label)}
                        aria-expanded={collapsed ? undefined : isOpen}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          ITEM,
                          "cursor-pointer",
                          collapsed ? "justify-center px-0" : "justify-between",
                          isParentActive
                            ? collapsed
                              ? "bg-primary text-on-primary shadow-[0_10px_20px_-10px_rgba(15,122,56,0.55)]"
                              : "bg-primary/10 font-semibold text-primary"
                            : ITEM_INACTIF
                        )}
                      >
                        <SurvolPill visible={survol === item.label && !isParentActive} />
                        <span className="relative z-10 flex items-center gap-3">
                          <ItemIcon icon={item.icon} active={isParentActive} />
                          {!collapsed && <span>{item.label}</span>}
                        </span>

                        {!collapsed && (
                          <CaretDown
                            size={16}
                            weight="bold"
                            className={cn(
                              "relative z-10 shrink-0 transition-transform duration-300",
                              isOpen && "rotate-180"
                            )}
                            aria-hidden="true"
                          />
                        )}
                      </button>

                      {!collapsed && (
                        <div
                          className={cn(
                            "grid transition-[grid-template-rows] duration-300 ease-in-out",
                            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                          )}
                        >
                          <div className="overflow-hidden">
                            {/* Fil vertical qui relie les sous-liens à leur parent. */}
                            <ul className="relative ml-[23px] mt-1 flex flex-col gap-0.5 border-l-2 border-outline-variant py-0.5 pl-3">
                              {item.children.map((child) => {
                                const isChildActive = child.link === pathname;
                                const cle = `${item.label}/${child.label}`;

                                return (
                                  <li key={child.label} className="relative">
                                    {/* Repère sur le fil, vert pour la page actuelle. */}
                                    <span
                                      aria-hidden="true"
                                      className={cn(
                                        "absolute -left-[17px] top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-surface-container-low transition-colors duration-200",
                                        isChildActive ? "bg-primary" : "bg-outline-variant"
                                      )}
                                    />
                                    <Link
                                      href={withEntreprise(child.link)}
                                      tabIndex={isOpen ? undefined : -1}
                                      aria-current={isChildActive ? "page" : undefined}
                                      onMouseEnter={() => setSurvol(cle)}
                                      onClick={onNavigate}
                                      className={cn(
                                        "relative flex min-h-9 items-center rounded-lg px-3 py-2 text-[14px] font-medium leading-5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                                        isChildActive
                                          ? "bg-primary text-on-primary shadow-[0_8px_16px_-10px_rgba(15,122,56,0.6)]"
                                          : ITEM_INACTIF
                                      )}
                                    >
                                      <SurvolPill visible={survol === cle && !isChildActive} />
                                      <span className="relative z-10 flex items-center gap-2.5">
                                        <ItemIcon icon={child.icon} active={isChildActive} size={16} />
                                        {child.label}
                                      </span>
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

                // Cas 2 : item pas encore branché (pas de lien)
                if (!item.link) {
                  return (
                    <ItemBientot key={item.label} icon={item.icon} label={item.label} collapsed={collapsed} />
                  );
                }

                // Cas 3 : item simple
                const isActive = item.link === pathname;

                return (
                  <Link
                    key={item.label}
                    href={item.link}
                    aria-current={isActive ? "page" : undefined}
                    onMouseEnter={() => setSurvol(item.label)}
                    onClick={onNavigate}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      ITEM,
                      collapsed && "justify-center px-0",
                      isActive
                        ? "bg-primary text-on-primary shadow-[0_10px_20px_-10px_rgba(15,122,56,0.55)]"
                        : ITEM_INACTIF
                    )}
                  >
                    <SurvolPill visible={survol === item.label && !isActive} />
                    <span className="relative z-10 flex min-w-0 items-center gap-3">
                      <ItemIcon icon={item.icon} active={isActive} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </span>
                  </Link>
                );
              })}
            </div>
          ))}

          {/* Tout ce qui suit reste DANS le flux défilant (paramètres,
              encart Pro, déconnexion) : rien n'est figé en bas pendant
              que le reste bouge. Seul l'en-tête reste fixe. */}
        
        {/* CEST ICI QUE JAI RETIRE LE COMPOSANT PARAMETRES */}

          {/* Encart Pro et déconnexion : mêmes pastilles à remplissage
              que le composant <Button> partagé (voir ui/Button.tsx),
              reproduites ici pour leurs couleurs propres. L'encart est un
              aplat `primary` (pas de dégradé ni de reflet). */}
          <div className="flex flex-col gap-2">
            <div
              className={cn(
                "flex flex-col gap-3 rounded-xl bg-primary",
                collapsed ? "p-2.5" : "p-4"
              )}
            >
              {!collapsed && (
                <div className="flex flex-col gap-1">
                  <span className="text-[14px] font-bold text-white">Passez à l&apos;offre Pro</span>
                  <span className="text-[12px] leading-snug text-white/85">
                    IA illimitée, exports, projets illimités
                  </span>
                </div>
              )}
              <button
                type="button"
                disabled
                aria-disabled="true"
                title="Passer à la version Pro (bientôt)"
                aria-label={collapsed ? "Passer à la version Pro (bientôt)" : undefined}
                className="group relative flex cursor-default items-center justify-center gap-2 overflow-hidden rounded-[100px] border-[1.5px] border-white/25 bg-white/10 px-3.5 py-3 text-[14px] font-bold text-white transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-xl hover:border-transparent active:scale-[0.97]"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-white opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100"
                />
                <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-primary">
                  <Crown size={16} weight="duotone" className="shrink-0" aria-hidden="true" />
                  {!collapsed && "Passer à Pro"}
                </span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Se déconnecter"
              aria-label={collapsed ? "Se déconnecter" : undefined}
              className="group relative flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-[100px] border-[1.5px] border-outline-variant bg-transparent px-3.5 py-3 text-[14px] font-bold text-on-surface-variant transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] hover:rounded-xl hover:border-transparent hover:text-white active:scale-[0.97]"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 z-0 aspect-square w-[130%] -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-primary opacity-0 transition-all duration-[800ms] ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:scale-100 group-hover:opacity-100"
              />
              <span className="relative z-10 flex items-center gap-2">
                <SignOut
                  size={16}
                  weight="bold"
                  className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
                {!collapsed && "Se déconnecter"}
              </span>
            </button>
          </div>
        </div>
      </nav>
    </LayoutGroup>
  );
}
