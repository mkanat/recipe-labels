import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "./button";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex h-14 w-full rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-lg font-medium text-white shadow-inner transition-all placeholder:text-zinc-500 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/50 focus:outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full resize-y rounded-2xl border border-zinc-800 bg-zinc-900/50 px-4 py-4 text-lg font-medium text-white shadow-inner transition-all placeholder:text-zinc-500 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/50 focus:outline-none",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";
