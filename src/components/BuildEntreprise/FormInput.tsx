import type { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  name: string;
  label: string;
  icon?: string;
  hint?: string;
}

export default function FormInput({
  id,
  name,
  label,
  type = "text",
  placeholder,
  icon,
  hint,
  required = false,
  ...props
}: FormInputProps) {
  return (
    <div className="group">
      <label
        className="mb-2 block font-label-md text-label-md text-on-surface-variant transition-colors group-focus-within:text-primary"
        htmlFor={id}
      >
        {label}
        {required && <span className="ml-1 text-primary" aria-hidden="true">*</span>}
      </label>
      <div className="relative transition-transform duration-200 group-focus-within:-translate-y-0.5">
        {icon && (
          <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[20px] text-outline transition-colors duration-200 group-focus-within:text-primary">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className={`h-14 w-full rounded-xl border border-outline-variant bg-surface px-4 text-body-md text-on-surface shadow-sm outline-none transition-all duration-200 placeholder:text-outline/70 hover:border-primary/50 hover:shadow-md focus:border-primary focus:ring-4 focus:ring-primary/10 ${icon ? "pl-11" : ""}`}
          {...props}
        />
      </div>
      {hint && (
        <p className="mt-1.5 font-body-sm text-[13px] text-outline">{hint}</p>
      )}
    </div>
  );
}