import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  delta,
  positiveIsGood = true,
  hero = false,
}: {
  label: string;
  value: string;
  hint?: React.ReactNode;
  icon: LucideIcon;
  delta?: number | null;
  positiveIsGood?: boolean;
  hero?: boolean;
}) {
  const hasDelta = typeof delta === "number" && Number.isFinite(delta);
  const isUp = hasDelta && delta! >= 0;
  const isGood = hasDelta ? (isUp ? positiveIsGood : !positiveIsGood) : true;
  const DeltaIcon = !hasDelta ? Minus : isUp ? ArrowUpRight : ArrowDownRight;

  return (
    <div
      className={cn(
        "relative flex flex-col justify-between overflow-hidden rounded-lg border p-4 transition-colors duration-150",
        hero
          ? "border-secondary-950 border-t-[3px] border-t-accent bg-secondary text-white shadow-xs"
          : "border-slate-200/95 bg-white shadow-xs hover:border-slate-300",
      )}
    >
      {/* Fila superior: Etiqueta técnica + Icono de precisión */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
            hero ? "text-slate-300" : "text-ink-subtle",
          )}
        >
          {label}
        </span>
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded border",
            hero
              ? "border-white/15 bg-white/[0.06] text-accent-300"
              : "border-slate-200/80 bg-slate-50 text-primary",
          )}
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />
        </div>
      </div>

      {/* Bloque central: Monto tabular + Variación mensual */}
      <div className="mt-3 flex items-baseline justify-between gap-2">
        <p
          className={cn(
            "font-mono text-[23px] font-semibold leading-none tracking-tight tabular-nums sm:text-[24px]",
            hero ? "text-white" : "text-ink",
          )}
        >
          {value}
        </p>

        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
            hero
              ? "bg-white/10 text-white ring-1 ring-inset ring-white/15"
              : hasDelta
                ? isGood
                  ? "bg-success-soft text-emerald-800 ring-1 ring-inset ring-emerald-600/20"
                  : "bg-danger-soft text-red-700 ring-1 ring-inset ring-red-600/20"
                : "bg-slate-100 text-slate-500",
          )}
          title="Variación respecto al mes anterior"
        >
          <DeltaIcon className="h-2.5 w-2.5" />
          {hasDelta ? `${delta! > 0 ? "+" : ""}${delta!.toFixed(1)}%` : "0.0%"}
        </span>
      </div>

      {/* Pie de métrica: Subtítulo o desglose contable */}
      {hint && (
        <div
          className={cn(
            "mt-3 border-t pt-2 text-[11px] leading-snug",
            hero
              ? "border-white/10 text-slate-300/85"
              : "border-slate-100 text-ink-muted",
          )}
        >
          {hint}
        </div>
      )}
    </div>
  );
}