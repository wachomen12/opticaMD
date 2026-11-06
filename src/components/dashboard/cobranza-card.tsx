import Link from "next/link";
import { ArrowUpRight, Glasses, Scale } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { money, percent } from "@/lib/format";
import type { Kpis } from "@/lib/accounting";
import { cn } from "@/lib/utils";

export function CobranzaCard({
  kpis,
  porCobrarTotal,
  enTaller,
}: {
  kpis: Kpis;
  porCobrarTotal: number;
  enTaller: number;
}) {
  const cobradoVentasMes = Math.max(0, kpis.ventas - kpis.porCobrarMes);
  const sinVentas = kpis.ventas <= 0;
  const pct = sinVentas ? 100 : percent(cobradoVentasMes, kpis.ventas);
  const barraCobrado = Math.min(100, Math.max(0, pct));

  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden rounded-lg border-slate-200/95 shadow-xs">
      <CardHeader className="flex-row items-center justify-between gap-2 border-b border-slate-200/90 bg-slate-50/60 px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-[2.5px] rounded-xs bg-accent" />
            <CardTitle className="font-display text-[14.5px] font-semibold tracking-tight text-ink">
              Estado de Cobranza
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-[11.5px] text-ink-muted">
            Efectividad de recaudo sobre facturación mensual.
          </CardDescription>
        </div>
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-primary">
          <Scale className="h-3.5 w-3.5" strokeWidth={1.85} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-4">
        {/* Bloque superior: Índice de efectividad + Barra técnica segmentada */}
        <div className="rounded-md border border-slate-200/90 bg-slate-50/50 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="block font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                Tasa de Recaudación
              </span>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className="font-mono text-[24px] font-bold leading-none tracking-tight tabular-nums text-ink">
                  {sinVentas ? "—" : `${pct}%`}
                </span>
                <span className="font-mono text-[10px] font-medium uppercase text-emerald-700">
                  {sinVentas
                    ? "Sin facturación"
                    : pct >= 85
                      ? "Óptimo"
                      : pct >= 60
                        ? "En curso"
                        : "Por gestionar"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="block font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
                Facturado Mes
              </span>
              <span className="mt-0.5 block font-mono text-[13.5px] font-semibold tabular-nums text-ink">
                {money(kpis.ventas)}
              </span>
            </div>
          </div>

          {/* Barra lineal de precisión */}
          <div className="mt-3">
            <div className="flex h-2 w-full overflow-hidden rounded-xs bg-slate-200/90 p-[1px]">
              {!sinVentas && (
                <>
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${barraCobrado}%` }}
                    title={`Cobrado: ${money(cobradoVentasMes)}`}
                  />
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${Math.max(0, 100 - barraCobrado)}%` }}
                    title={`Por cobrar: ${money(kpis.porCobrarMes)}`}
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Grilla contable: Cobrado vs. Saldo del mes */}
        <div className="grid grid-cols-2 divide-x divide-slate-200 rounded-md border border-slate-200 bg-white">
          <div className="p-3">
            <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-ink-subtle">
              <span className="h-2 w-2 rounded-[1px] bg-primary" />
              <span>Cobrado Mes</span>
            </div>
            <p className="mt-1 font-mono text-[15px] font-semibold tabular-nums text-ink">
              {money(cobradoVentasMes)}
            </p>
          </div>

          <div className="p-3">
            <div className="flex items-center gap-1.5 font-mono text-[9.5px] font-semibold uppercase tracking-wider text-ink-subtle">
              <span className="h-2 w-2 rounded-[1px] bg-accent" />
              <span>Pendiente Mes</span>
            </div>
            <p
              className={cn(
                "mt-1 font-mono text-[15px] font-semibold tabular-nums",
                kpis.porCobrarMes > 0 ? "text-accent-700" : "text-ink",
              )}
            >
              {money(kpis.porCobrarMes)}
            </p>
          </div>
        </div>

        {/* Resumen de cartera histórica acumulada */}
        <div className="space-y-2 border-t border-slate-200/80 pt-3">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-ink-muted">Cartera total acumulada por cobrar</span>
            <span
              className={cn(
                "font-mono text-[12.5px] font-bold tabular-nums",
                porCobrarTotal > 0 ? "text-accent-700" : "text-emerald-700",
              )}
            >
              {money(porCobrarTotal)}
            </span>
          </div>
        </div>

        {/* Enlace operativo a trabajos en taller */}
        <Link
          href="/ventas?entrega=EN_TALLER"
          className={cn(
            "group flex items-center justify-between rounded-md border px-3 py-2 transition-colors",
            enTaller > 0
              ? "border-accent-200 bg-accent-50/50 hover:border-accent-300 hover:bg-accent-50"
              : "border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-slate-100/70",
          )}
        >
          <span className="flex items-center gap-2 text-[11.5px] font-medium text-ink">
            <Glasses
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                enTaller > 0 ? "text-accent-700" : "text-primary",
              )}
            />
            <span>
              <strong className="font-mono font-bold tabular-nums">{enTaller}</strong>{" "}
              {enTaller === 1 ? "orden en taller óptico" : "órdenes en taller óptico"}
            </span>
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-ink-subtle transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
        </Link>
      </CardContent>
    </Card>
  );
}