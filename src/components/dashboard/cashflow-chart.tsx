import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthPoint } from "@/lib/accounting";
import { money, moneyCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

const BARS = [
  { key: "cobrado", label: "Cobrado", color: "#123568" },
  { key: "compras", label: "Compras", color: "#235D92" },
  { key: "gastos", label: "Gastos", color: "#EA711B" },
] as const;

export function CashflowChart({ series }: { series: MonthPoint[] }) {
  const W = 760;
  const H = 256;
  const padL = 56;
  const padR = 14;
  const padT = 16;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const all = series.flatMap((p) => [p.cobrado, p.compras, p.gastos, p.utilidad]);
  const rawMax = Math.max(...all, 100);
  const rawMin = Math.min(...all, 0);
  const step = rawMax > 6000 ? 2000 : rawMax > 3000 ? 1000 : rawMax > 1200 ? 500 : 100;
  const max = Math.ceil(rawMax / step) * step;
  const min = rawMin < 0 ? -Math.ceil(Math.abs(rawMin) / step) * step : 0;
  const span = max - min || 1;

  const y = (value: number) => padT + innerH * ((max - value) / span);
  const baseline = y(0);
  const slot = innerW / Math.max(series.length, 1);
  const barW = Math.min(15, Math.max(7, (slot - 20) / 3));
  const gap = 2.5;
  const groupW = barW * 3 + gap * 2;
  const ticks = Array.from({ length: 5 }, (_, i) => min + (span * i) / 4);
  const selected = series[series.length - 1];

  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden rounded-lg border-slate-200/95 shadow-xs">
      <CardHeader className="flex-col gap-3 border-b border-slate-200/90 bg-slate-50/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-[2.5px] rounded-xs bg-primary" />
            <CardTitle className="font-display text-[14.5px] font-semibold tracking-tight text-ink">
              Flujo de Caja Operativo
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-[11.5px] text-ink-muted">
            Comparativa de ingresos efectivamente cobrados, compras y egresos ({series.length} meses).
          </CardDescription>
        </div>

        {/* Leyenda técnica */}
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 rounded-md border border-slate-200/90 bg-white px-2.5 py-1.5">
          {BARS.map((bar) => (
            <span
              key={bar.key}
              className="flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-ink-muted"
            >
              <span
                className="h-2.5 w-2.5 rounded-[1px]"
                style={{ backgroundColor: bar.color }}
              />
              {bar.label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 border-l border-slate-200 pl-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            <span className="h-0 w-3.5 border-t-2 border-emerald-600" />
            Utilidad
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="overflow-x-auto scrollbar-slim">
          <div className="min-w-[540px] sm:min-w-0">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={`Flujo de caja de los últimos ${series.length} meses. Utilidad del mes actual: ${
                selected ? money(selected.utilidad) : "$0.00"
              }`}
              className="w-full select-none"
            >
              {/* Resaltado técnico del último mes (período activo) */}
              {series.length > 0 && (
                <g>
                  <rect
                    x={padL + slot * (series.length - 1) + 4}
                    y={padT}
                    width={Math.max(0, slot - 8)}
                    height={innerH}
                    rx={2}
                    fill="#F8FAFC"
                    stroke="#E2E8F0"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                </g>
              )}

              {/* Grilla horizontal + etiquetas tabulares del eje Y */}
              {ticks.map((tick, index) => {
                const ty = y(tick);
                const isZero = Math.abs(tick) < 0.001;
                return (
                  <g key={index}>
                    <line
                      x1={padL}
                      x2={W - padR}
                      y1={ty}
                      y2={ty}
                      stroke={isZero ? "#CBD5E1" : "#E2E8F0"}
                      strokeWidth={isZero ? 1.25 : 1}
                      strokeDasharray={isZero ? undefined : "2 3"}
                    />
                    <text
                      x={padL - 8}
                      y={ty + 3}
                      textAnchor="end"
                      fontSize={9.5}
                      fill="#64748B"
                      fontFamily="var(--font-mono), monospace"
                    >
                      {moneyCompact(tick)}
                    </text>
                  </g>
                );
              })}

              {/* Línea base cero explícita cuando existen valores negativos */}
              {min < 0 && (
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={baseline}
                  y2={baseline}
                  stroke="#94A3B8"
                  strokeWidth={1.25}
                />
              )}

              {/* Columnas agrupadas por mes */}
              {series.map((point, index) => {
                const center = padL + slot * index + slot / 2;
                const startX = center - groupW / 2;
                const isCurrent = index === series.length - 1;

                return (
                  <g key={point.key}>
                    {BARS.map((bar, barIndex) => {
                      const value = point[bar.key];
                      const top = y(Math.max(0, value));
                      const height = Math.max(2, baseline - top);
                      const x = startX + barIndex * (barW + gap);
                      return (
                        <rect
                          key={bar.key}
                          x={x}
                          y={top}
                          width={barW}
                          height={height}
                          rx={1.5}
                          fill={bar.color}
                          opacity={isCurrent ? 1 : 0.85}
                          className="transition-opacity duration-150 hover:opacity-100"
                        >
                          <title>{`${point.label} · ${bar.label}: ${money(value)}`}</title>
                        </rect>
                      );
                    })}

                    <text
                      x={center}
                      y={H - 8}
                      textAnchor="middle"
                      fontSize={9.5}
                      fill={isCurrent ? "#0B1324" : "#64748B"}
                      fontWeight={isCurrent ? 700 : 500}
                      fontFamily="var(--font-mono), monospace"
                    >
                      {point.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {/* Polilínea de Utilidad Neta */}
              {series.length > 1 && (
                <path
                  d={series
                    .map((point, index) => {
                      const center = padL + slot * index + slot / 2;
                      return `${index === 0 ? "M" : "L"} ${center} ${y(point.utilidad)}`;
                    })
                    .join(" ")}
                  fill="none"
                  stroke="#059669"
                  strokeWidth={1.85}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Nodos de precisión sobre la curva de utilidad */}
              {series.map((point, index) => {
                const center = padL + slot * index + slot / 2;
                const isPositive = point.utilidad >= 0;
                return (
                  <circle
                    key={`dot-${point.key}`}
                    cx={center}
                    cy={y(point.utilidad)}
                    r={3}
                    fill="#FFFFFF"
                    stroke={isPositive ? "#059669" : "#DC2626"}
                    strokeWidth={2}
                  >
                    <title>{`${point.label} · Utilidad neta: ${money(point.utilidad)}`}</title>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Cinta inferior de auditoría del último mes */}
        {selected && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-md border border-slate-200/90 bg-slate-50/70 p-2.5 sm:grid-cols-4">
            <div className="px-2">
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-wider text-ink-subtle">
                Período ({selected.label})
              </span>
              <span className="mt-0.5 block font-mono text-[12.5px] font-semibold tabular-nums text-secondary">
                {money(selected.cobrado)}
              </span>
            </div>
            <div className="border-l border-slate-200/80 px-2">
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-wider text-ink-subtle">
                Compras Mes
              </span>
              <span className="mt-0.5 block font-mono text-[12.5px] font-semibold tabular-nums text-primary">
                {money(selected.compras)}
              </span>
            </div>
            <div className="border-t border-slate-200/80 px-2 pt-1.5 sm:border-l sm:border-t-0 sm:pt-0">
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-wider text-ink-subtle">
                Gastos Operativos
              </span>
              <span className="mt-0.5 block font-mono text-[12.5px] font-semibold tabular-nums text-accent-700">
                {money(selected.gastos)}
              </span>
            </div>
            <div className="border-l border-t border-slate-200/80 px-2 pt-1.5 sm:border-t-0 sm:pt-0">
              <span className="block font-mono text-[9px] font-semibold uppercase tracking-wider text-ink-subtle">
                Utilidad Caja
              </span>
              <span
                className={cn(
                  "mt-0.5 block font-mono text-[12.5px] font-bold tabular-nums",
                  selected.utilidad >= 0 ? "text-emerald-700" : "text-red-600",
                )}
              >
                {money(selected.utilidad)}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}