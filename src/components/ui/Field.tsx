"use client";

import { useId, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, CircleAlert, Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type FieldProps = Omit<ComponentPropsWithoutRef<"input">, "id"> & {
  label: string;
  /** Icône affichée à gauche dans le champ ; elle passe au violet quand le champ est actif. */
  icon?: LucideIcon;
  /** Texte d'aide affiché sous le champ (remplacé par l'erreur s'il y en a une). */
  hint?: string;
  /** Message d'erreur propre à ce champ. */
  error?: string;
  /** Élément placé à droite du libellé (ex. lien « Mot de passe oublié »). */
  labelAside?: ReactNode;
};

// Au repos : fond légèrement teinté. Au focus : fond blanc, bordure violette
// et anneau qui s'élargit (transition 200 ms).
const INPUT =
  "block h-12 w-full rounded-[10px] border bg-surface-container-low text-[15px] text-on-surface " +
  "focus:bg-white " +
  "placeholder:text-outline/60 transition-all duration-200 ease-out " +
  "focus:outline-none focus:ring-4 " +
  "disabled:cursor-not-allowed disabled:bg-surface-container disabled:text-outline";

function inputClasses(error: string | undefined, withIcon: boolean) {
  return cn(
    INPUT,
    withIcon ? "pl-11" : "pl-3.5",
    error
      ? "border-error focus:border-error focus:ring-error/10"
      : "border-border-strong hover:border-outline/50 focus:border-primary focus:ring-primary/10"
  );
}

function FieldShell({
  id,
  label,
  labelAside,
  hint,
  error,
  icon: Icon,
  children,
}: {
  id: string;
  label: string;
  labelAside?: ReactNode;
  hint?: string;
  error?: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="group/field space-y-1.5">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={id}
          className={cn(
            "text-sm font-medium transition-colors duration-200",
            error ? "text-error" : "text-on-surface group-focus-within/field:text-primary"
          )}
        >
          {label}
        </label>
        {labelAside}
      </div>

      {/* Tremblement quand une erreur apparaît (sans recréer le champ, qui
          perdrait sinon le focus pendant la saisie). */}
      <motion.div
        className="relative"
        animate={{ x: error ? [0, -5, 5, -4, 4, -2, 0] : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.38, ease: "easeInOut" }}
      >
        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-3.5 top-1/2 z-10 h-[18px] w-[18px] -translate-y-1/2 transition-all duration-200",
              error
                ? "text-error"
                : "text-outline group-focus-within/field:scale-110 group-focus-within/field:text-primary"
            )}
          />
        )}
        {children}
      </motion.div>

      {error ? (
        <p id={`${id}-message`} role="alert" className="animate-rise-in flex items-center gap-1.5 text-[13px] text-error">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-message`} className="text-[13px] text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Champ de formulaire standard : libellé visible, icône, aide, erreur sous le champ. */
export function TextField({ label, icon, hint, error, labelAside, className, ...inputProps }: FieldProps) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} labelAside={labelAside} hint={hint} error={error} icon={icon}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className={cn(inputClasses(error, Boolean(icon)), "pr-3.5", className)}
        {...inputProps}
      />
    </FieldShell>
  );
}

type SelectFieldProps = Omit<ComponentPropsWithoutRef<"select">, "id"> & {
  label: string;
  icon?: LucideIcon;
  hint?: string;
  error?: string;
  labelAside?: ReactNode;
  /** Première option, non sélectionnable, affichée tant qu'aucun choix n'est fait. */
  placeholder?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
};

/** Liste déroulante native habillée comme TextField (même repos, même focus, chevron lucide). */
export function SelectField({
  label,
  icon,
  hint,
  error,
  labelAside,
  placeholder,
  options,
  className,
  ...selectProps
}: SelectFieldProps) {
  const id = useId();
  const vide = selectProps.value === "" || selectProps.value === undefined;

  return (
    <FieldShell id={id} label={label} labelAside={labelAside} hint={hint} error={error} icon={icon}>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className={cn(
          inputClasses(error, Boolean(icon)),
          "cursor-pointer appearance-none pr-11",
          vide && "text-outline/60",
          className
        )}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-on-surface">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-outline transition-transform duration-200 group-focus-within/field:rotate-180 group-focus-within/field:text-primary"
      />
    </FieldShell>
  );
}

/** Champ mot de passe avec bouton afficher/masquer. */
export function PasswordField({ label, icon, hint, error, labelAside, className, ...inputProps }: FieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);

  return (
    <FieldShell id={id} label={label} labelAside={labelAside} hint={hint} error={error} icon={icon}>
      <input
        id={id}
        type={visible ? "text" : "password"}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? `${id}-message` : undefined}
        className={cn(inputClasses(error, Boolean(icon)), "pr-12", className)}
        {...inputProps}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
        className="absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-outline transition-colors hover:bg-primary/10 hover:text-primary"
      >
        {visible ? (
          <EyeOff className="h-[18px] w-[18px]" aria-hidden="true" />
        ) : (
          <Eye className="h-[18px] w-[18px]" aria-hidden="true" />
        )}
      </button>
    </FieldShell>
  );
}

/** Message d'erreur global d'un formulaire (ex. identifiants refusés par le serveur). */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="animate-rise-in flex items-start gap-2.5 rounded-xl border border-error/20 bg-error-container/40 px-3.5 py-3 text-sm text-on-error-container"
    >
      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
