import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary-50 text-primary ring-primary-100",
  accent: "bg-accent-50 text-accent-600 ring-accent-100",
  navy: "bg-secondary-50 text-secondary-800 ring-secondary-100",
  green: "bg-success-soft text-emerald-600 ring-emerald-100",
  slate: "bg-slate-100 text-slate-500 ring-slate-200",
} as const;

export function SummaryStat({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card",
        className,
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-[10px] font-semibold uppercase tracking-[0.11em] text-ink-subtle">
          {label}
        </p>
        <p className="mt-1.5 font-display text-[21px] font-bold leading-none tabular-nums text-ink">
          {value}
        </p>
        {hint && <p className="mt-1.5 truncate text-[10.5px] text-ink-muted">{hint}</p>}
      </div>
      <span
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset",
          TONES[tone],
        )}
      >
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
    </div>
  );
}
