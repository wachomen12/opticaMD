import Link from "next/link";
import { ArrowUpRight, Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import type { CategoriaTotal } from "@/lib/accounting";
import { money, percent } from "@/lib/format";

export function ExpenseBreakdown({
  categorias,
  total,
}: {
  categorias: CategoriaTotal[];
  total: number;
}) {
  const totalRegistros = categorias.reduce((acc, cat) => acc + cat.count, 0);

  return (
    <Card className="flex h-full flex-col justify-between overflow-hidden rounded-lg border-slate-200/95 shadow-xs">
      <CardHeader className="flex-row items-center justify-between gap-2 border-b border-slate-200/90 bg-slate-50/60 px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-[2.5px] rounded-xs bg-accent" />
            <CardTitle className="font-display text-[14.5px] font-semibold tracking-tight text-ink">
              Estructura de Gastos
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-[11.5px] text-ink-muted">
            Distribución porcentual de egresos operativos del mes.
          </CardDescription>
        </div>

        <Link
          href="/gastos"
          className="group inline-flex h-7 items-center gap-1 rounded border border-slate-200 bg-white px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary transition-colors hover:border-primary hover:bg-primary-50/50"
        >
          <span>Detalle</span>
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between p-4">
        {categorias.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Sin egresos registrados"
            description="Registra los gastos operativos del período para auditar su distribución."
            className="my-auto py-8"
          />
        ) : (
          <div className="space-y-4">
            {/* Barra técnica de composición acumulada (100%) */}
            {total > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-[9.5px] uppercase tracking-wider text-ink-subtle">
                  <span>Participación por rubro</span>
                  <span>{totalRegistros} comprobantes</span>
                </div>
                <div className="flex h-2 w-full gap-[1px] overflow-hidden rounded-xs bg-slate-200 p-[1px]">
                  {categorias.map((categoria) => {
                    const pct = Math.max(percent(categoria.total, total), 2);
                    return (
                      <div
                        key={`stack-${categoria.key}`}
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: categoria.color,
                        }}
                        title={`${categoria.label}: ${money(categoria.total)} (${percent(categoria.total, total)}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tabla compacta de rubros */}
            <div className="divide-y divide-slate-100 rounded-md border border-slate-200/90 bg-white">
              {categorias.map((categoria) => {
                const pct = percent(categoria.total, total);
                return (
                  <div
                    key={categoria.key}
                    className="p-2.5 transition-colors hover:bg-slate-50/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[1px]"
                          style={{ backgroundColor: categoria.color }}
                        />
                        <span className="truncate text-[12px] font-semibold text-ink">
                          {categoria.label}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-ink-subtle">
                          {categoria.count} {categoria.count === 1 ? "reg." : "regs."}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-baseline gap-2">
                        <span className="font-mono text-[10px] font-medium tabular-nums text-ink-subtle">
                          {pct}%
                        </span>
                        <span className="min-w-[74px] text-right font-mono text-[12px] font-semibold tabular-nums text-ink">
                          {money(categoria.total)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-xs bg-slate-100">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${Math.max(pct, 2)}%`,
                          backgroundColor: categoria.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cinta inferior de totalización */}
        <div className="mt-4 flex items-center justify-between rounded-md border border-slate-200/90 bg-slate-50/70 px-3 py-2.5">
          <div>
            <span className="block font-mono text-[9.5px] font-semibold uppercase tracking-wider text-ink-subtle">
              Total Egresos Operativos
            </span>
          </div>
          <span className="font-mono text-[15px] font-bold tabular-nums text-ink">
            {money(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}