"use client";

import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-950 group-[.toaster]:text-zinc-50 group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-zinc-50 group-[.toast]:text-zinc-950 group-[.toast]:shadow-lg group-[.toast]:font-semibold group-[.toast]:rounded-xl group-[.toast]:transition-all hover:group-[.toast]:scale-105",
          cancelButton:
            "group-[.toast]:bg-zinc-800 group-[.toast]:text-zinc-400 group-[.toast]:rounded-xl",
          error:
            "group-[.toast]:border-rose-500/50 group-[.toast]:bg-rose-500/10 group-[.toast]:text-rose-50",
          success:
            "group-[.toast]:border-emerald-500/50 group-[.toast]:bg-emerald-500/10 group-[.toast]:text-emerald-50",
        },
      }}
      {...props}
    />
  );
}
