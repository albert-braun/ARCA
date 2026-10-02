import type { ButtonHTMLAttributes } from "react";

export function buttonClass(variant: "primary" | "ghost" | "quiet" = "primary", className = "") {
  const styles = {
    primary: "bg-forest text-paper hover:bg-moss",
    ghost: "border border-ink/15 bg-card text-ink hover:border-ink",
    quiet: "text-ink hover:bg-paper-deep",
  }[variant];
  return `inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-not-allowed disabled:opacity-40 ${styles} ${className}`;
}

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "quiet" }) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}
