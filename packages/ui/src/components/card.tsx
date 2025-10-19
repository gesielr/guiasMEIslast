import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { shadows } from "../theme";

type CardProps = {
  title?: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Card({ title, subtitle, footer, children, className }: CardProps) {
  return (
    <div
      className={twMerge(
        "rounded-xl border border-slate-100 bg-white p-6 shadow-[" + shadows.sm + "]",
        className
      )}
    >
      {(title || subtitle) && (
        <header className="mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-900">{title}</h3>}
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </header>
      )}
      <div className="space-y-4">{children}</div>
      {footer && <footer className="mt-6 border-t border-slate-100 pt-4">{footer}</footer>}
    </div>
  );
}
