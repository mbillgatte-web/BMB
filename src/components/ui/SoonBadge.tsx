import { cn } from "@/lib/cn";

/**
 * Mention « Bientôt » posée sur une fonctionnalité visible mais pas encore
 * branchée (recherche, notifications, connexion Google...). L'élément qui la
 * porte doit aussi être désactivé : le badge informe, il ne bloque rien.
 */
export default function SoonBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-outline-variant bg-surface-container px-1.5 py-px text-[11px] font-medium leading-4 text-on-surface-variant",
        className
      )}
    >
      Bientôt
    </span>
  );
}
