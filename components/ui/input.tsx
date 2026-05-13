import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--tm-ink-700)]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-11 w-full rounded-[var(--tm-r-md)] border border-[var(--tm-ink-300)] bg-white px-3.5 py-2 text-sm text-[var(--tm-ink-900)] placeholder:text-[var(--tm-ink-300)] transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-[var(--tm-green-500)] focus:border-[var(--tm-green-500)]",
            "disabled:cursor-not-allowed disabled:bg-[var(--tm-ink-100)] disabled:text-[var(--tm-ink-500)]",
            error && "border-[var(--tm-danger)] focus:ring-[var(--tm-danger)]",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-[var(--tm-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
