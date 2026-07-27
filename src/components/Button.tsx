import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { Link } from "react-router-dom";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-safety-600 text-white hover:bg-safety-700",
  secondary: "border-2 border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white",
  ghost: "text-charcoal-900 underline underline-offset-4 decoration-safety-500 hover:text-safety-600",
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const BASE = "inline-flex items-center justify-center gap-2 font-semibold tracking-wide uppercase transition-colors";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function ButtonLink({
  to,
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: CommonProps & { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <Link
      to={to}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${variant !== "ghost" ? SIZE_CLASSES[size] : ""} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

export const Button = forwardRef<HTMLButtonElement, CommonProps & ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ variant = "primary", size = "md", className = "", children, ...rest }, ref) => (
    <button
      ref={ref}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${variant !== "ghost" ? SIZE_CLASSES[size] : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";
