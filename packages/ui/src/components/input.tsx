import { InputHTMLAttributes, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import { colors, radii } from "../theme";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        {label && <span>{label}</span>}
        <input
          ref={ref}
          className={twMerge(
            "h-11 rounded-md border border-slate-200 px-3 text-slate-900 shadow-sm focus:border-[" +
              colors.primary +
              "] focus:outline-none focus:ring-2 focus:ring-[" +
              colors.primary +
              "]",
            error && "border-[" + colors.danger + "] text-[" + colors.danger + "]",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-600">{error}</span>}
      </label>
    );
  }
);

Input.displayName = "Input";
