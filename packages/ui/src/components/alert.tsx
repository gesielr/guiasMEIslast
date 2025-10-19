import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { colors } from "../theme";

type Variant = "info" | "success" | "warning" | "error";

const variantStyles: Record<Variant, string> = {
  info: `bg-blue-50 text-[${colors.blue}] border border-blue-200`,
  success: `bg-emerald-50 text-[${colors.success}] border border-emerald-200`,
  warning: "bg-amber-50 text-amber-700 border border-amber-200",
  error: `bg-red-50 text-[${colors.danger}] border border-red-200`
};

type AlertProps = {
  title?: string;
  description: ReactNode;
  variant?: Variant;
  className?: string;
};

export function Alert({ title, description, variant = "info", className }: AlertProps) {
  return (
    <div className={twMerge("rounded-lg p-4", variantStyles[variant], className)}>
      {title && <h4 className="mb-1 font-medium">{title}</h4>}
      <div className="text-sm leading-relaxed">{description}</div>
    </div>
  );
}
