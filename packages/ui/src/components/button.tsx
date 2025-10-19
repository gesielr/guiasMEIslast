import { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { colors, radii, shadows } from "../theme";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Size = "sm" | "md" | "lg";

const baseStyles =
  "inline-flex items-center justify-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all";

const variantStyles: Record<Variant, string> = {
  primary: `bg-[${colors.primary}] text-white hover:bg-[${colors.primaryDark}] focus:ring-[${colors.primary}]`,
  secondary: `bg-[${colors.blue}] text-white hover:bg-blue-800 focus:ring-[${colors.blue}]`,
  danger: `bg-[${colors.danger}] text-white hover:bg-red-700 focus:ring-[${colors.danger}]`,
  ghost: `bg-transparent text-[${colors.slate}] hover:bg-slate-100 focus:ring-[${colors.gray}]`
};

const sizeStyles: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base"
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export function Button({
  className,
  children,
  variant = "primary",
  size = "md",
  isLoading,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        baseStyles,
        `rounded-[${radii.md}] shadow-[${shadows.sm}]`,
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Carregando..." : children}
    </button>
  );
}
