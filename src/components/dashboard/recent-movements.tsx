import Link from "next/link";
import { ArrowDownLeft, ArrowUpRight, Package, Receipt } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from "@/components/ui/table";
import type { Movimiento } from "@/lib/accounting";
import { ESTADO_PAGO_LABEL, ESTADO_PAGO_STYLE } from "@/lib/constants";
import { formatDate, money } from "@/lib/format";
import type { EstadoPago } from "@/lib/types";
import { cn } from "@/lib/utils";

const TYPE_META = {
  VENTA: {
    label: "Venta",
    icon: ArrowDownLeft,
    chip: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amount: "text-emerald-700 font-semibold",
    sign: "+",
  },
  COMPRA: {
    label: "Compra",
    icon: Package,
    chip: "border-primary-200 bg-primary-50 text-primary-900",
    amount: "text-ink font-medium",
    sign: "−",
  },
  GASTO: {
    label: "Gasto",
    icon: ArrowUpRight,
    chip: "border-amber-200 bg-amber-50 text-amber-900",
    amount: "text-ink font-medium",
    sign: "−",
  },
} as const;

export function RecentMovements({
  movimientos,
  titulo = "Movimientos recientes",
  descripcion = "Últimos registros de ventas, compras y gastos del período.",
  limite = 7,
  href = "/reportes",
  hrefLabel = "Ver reporte mensual",
}: {
  movimientos: Movimiento[];
  titulo?: string;
  descripcion?: string;
  limite?: number;
  href?: string;
  hrefLabel?: string;
}) {
  const visibles = movimientos.slice(0, limite);

  return (
    <Card className="overflow-hidden rounded-lg border-slate-200/95 shadow-xs">
      <CardHeader className="flex-row items-center justify-between gap-2 border-b border-slate-200/90 bg-slate-50/60 px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-[2.5px] rounded-xs bg-primary" />
            <CardTitle className="font-display text-[14.5px] font-semibold tracking-tight text-ink">
              {titulo}
            </CardTitle>
          </div>
          <CardDescription className="mt-0.5 text-[11.5px] text-ink-muted">
            {descripcion}
          </CardDescription>
        </div>

        <Link
          href={href}
          className="group inline-flex h-7 items-center gap-1 rounded border border-slate-200 bg-white px-2.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-primary transition-colors hover:border-primary hover:bg-primary-50/50"
        >
          <span>{hrefLabel}</span>
          <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0">
        {visibles.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Sin movimientos este mes"
            description="Registra una venta, compra o gasto operativo para comenzar el control contable."
            className="py-10"
          />
        ) : (
          <TableWrap>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="pl-4 font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-subtle sm:pl-5">
                    Detalle Operativo
                  </TableHead>
                  <TableHead className="hidden font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-subtle md:table-cell">
                    Categoría
                  </TableHead>
                  <TableHead className="font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-subtle">
                    Fecha
                  </TableHead>
                  <TableHead className="pr-4 text-right font-mono text-[10px] font-semibold uppercase tracking-wider text-ink-subtle sm:pr-5">
                    Monto
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-150">
                {visibles.map((movimiento) => {
                  const meta = TYPE_META[movimiento.tipo as keyof typeof TYPE_META] ?? TYPE_META.GASTO;
                  const Icon = meta.icon;
                  return (
                    <TableRow
                      key={`${movimiento.tipo}-${movimiento.id}`}
                      className="transition-colors hover:bg-slate-50/70"
                    >
                      <TableCell className="pl-4 sm:pl-5 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded border font-mono text-[10px]",
                              meta.chip,
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-medium text-ink">
                              {movimiento.descripcion}
                            </p>
                            <p className="truncate font-mono text-[10px] text-ink-subtle">
                              {movimiento.contraparte}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell py-2.5">
                        <span className="inline-flex rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10.5px] text-ink-muted">
                          {movimiento.categoria}
                        </span>
                      </TableCell>

                      <TableCell className="py-2.5">
                        <span className="whitespace-nowrap font-mono text-[11px] text-ink-muted tabular-nums">
                          {formatDate(movimiento.fecha)}
                        </span>
                      </TableCell>

                      <TableCell className="pr-4 text-right sm:pr-5 py-2.5">
                        <div className="flex flex-col items-end gap-0.5">
                          <span
                            className={cn(
                              "whitespace-nowrap font-mono text-[12.5px] tabular-nums",
                              meta.amount,
                            )}
                          >
                            {meta.sign}
                            {money(movimiento.monto)}
                          </span>

                          {movimiento.tipo === "VENTA" && movimiento.estado && (
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wide uppercase",
                                ESTADO_PAGO_STYLE[movimiento.estado as EstadoPago],
                              )}
                            >
                              {ESTADO_PAGO_LABEL[movimiento.estado as EstadoPago]}
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableWrap>
        )}

        {/* Pie técnico de auditoría */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-4 py-2.5 sm:px-5">
          <p className="font-mono text-[10.5px] text-ink-subtle">
            Mostrando <strong className="font-semibold text-ink">{visibles.length}</strong> de{" "}
            <strong className="font-semibold text-ink">{movimientos.length}</strong> registros
          </p>

          <div className="flex items-center gap-3 font-mono text-[10px] text-ink-subtle">
            <span className="hidden items-center gap-1 sm:flex">
              <ArrowDownLeft className="h-3 w-3 text-emerald-600" /> Cobro
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <ArrowUpRight className="h-3 w-3 text-amber-700" /> Egreso
            </span>
            <Badge variant="outline" className="font-mono text-[9.5px]">
              {new Set(movimientos.map((m) => m.tipo)).size} tipos
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}