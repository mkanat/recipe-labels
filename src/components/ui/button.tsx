import { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "default" | "lg" | "icon";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-2xl";

    const variants = {
      primary:
        "bg-white text-zinc-900 shadow-lg hover:shadow-xl hover:bg-zinc-50 border border-transparent",
      secondary: "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700 shadow-md",
      danger: "bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500/20",
      ghost: "bg-transparent text-zinc-300 hover:text-white hover:bg-zinc-800/50",
    };

    const sizes = {
      default: "h-12 px-6 text-base",
      lg: "h-16 px-8 text-lg",
      icon: "h-12 w-12",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
