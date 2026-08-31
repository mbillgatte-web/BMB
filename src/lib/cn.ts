/**
 * Concatène des classes conditionnelles en filtrant les valeurs falsy.
 * Volontairement minimal : pas de résolution de conflits Tailwind, donc
 * réservez `className` aux overrides de layout (w-full, self-end, absolute…)
 * plutôt qu'aux propriétés déjà pilotées par les variantes.
 */
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
