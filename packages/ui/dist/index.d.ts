import * as react_jsx_runtime from 'react/jsx-runtime';
import * as react from 'react';
import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

declare const colors: {
    primary: string;
    primaryDark: string;
    blue: string;
    success: string;
    danger: string;
    gray: string;
    slate: string;
};
declare const radii: {
    sm: string;
    md: string;
    lg: string;
};
declare const shadows: {
    sm: string;
    md: string;
};

type Variant$1 = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant$1;
    size?: Size;
    isLoading?: boolean;
}
declare function Button({ className, children, variant, size, isLoading, disabled, ...props }: ButtonProps): react_jsx_runtime.JSX.Element;

declare const Input: react.ForwardRefExoticComponent<InputHTMLAttributes<HTMLInputElement> & {
    label?: string | undefined;
    error?: string | undefined;
} & react.RefAttributes<HTMLInputElement>>;

type CardProps = {
    title?: string;
    subtitle?: string;
    footer?: ReactNode;
    children: ReactNode;
    className?: string;
};
declare function Card({ title, subtitle, footer, children, className }: CardProps): react_jsx_runtime.JSX.Element;

type Variant = "info" | "success" | "warning" | "error";
type AlertProps = {
    title?: string;
    description: ReactNode;
    variant?: Variant;
    className?: string;
};
declare function Alert({ title, description, variant, className }: AlertProps): react_jsx_runtime.JSX.Element;

export { Alert, Button, type ButtonProps, Card, Input, colors, radii, shadows };
