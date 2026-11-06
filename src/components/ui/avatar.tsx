import * as React from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  initials,
  className,
  tone = "primary",
}: {
  initials: string;
  className?: string;
  tone?: "primary" | "accent" | "navy" | "soft";
}) {
  const tones = {
    primary: "bg-primary-100 text-primary-800 ring-primary-200/60",
    accent: "bg-accent-100 text-accent-800 ring-accent-200/60",
    navy: "bg-secondary-100 text-secondary-900 ring-secondary-200/60",
    soft: "bg-slate-100 text-ink-muted ring-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold uppercase ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {initials}
    </span>
  );
}
