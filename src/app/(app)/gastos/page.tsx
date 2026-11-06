import type { Metadata } from "next";
import { CalendarClock, Receipt, Wallet, Repeat } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MonthPicker } from "@/components/ui/month-picker";
import { LedgerFilters } from "@/components/ui/ledger-filters";
import { SummaryStat } from "@/components/ui/summary-stat";
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
import { GastoDialog } from "@/components/forms/gasto-dialog";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { getDataset } from "@/lib/data";
import { getDashboardData } from "@/lib/accounting";
import {
  CATEGORIA_GASTO_LABEL,
  CATEGORIA_GASTO_OPTIONS,
} from "@/lib/constants";
import { formatDate, isInMonth, money, parseMonthParam } from "@/lib/format";
import type { CategoriaGasto } from "@/lib/types";

export const metadata: Metadata = { title: "Gastos operativos" };

export default async function GastosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; q?: string; categoria?: string }>;
}) {
  const params = await searchParams;
  const { mes, anio } = parseMonthParam(params.mes);
  const q = (params.q ?? "").trim().toLowerCase();
  const categoria = params.categoria ?? "TODAS";
  const mesParam = `${anio}-${String(mes + 1).padStart(2, "0")}`;

  const dataset = await getDataset();
  const data = getDashboardData(dataset, mes, anio);
  const gastosMes = dataset.gastos.filter((gasto) => isInMonth(gasto.fecha, mes, anio));

  const gastos = gastosMes.filter((gasto) => {
    if (categoria !== "TODAS" && gasto.categoria !== categoria) return false;
    if (!q) return true;
    return (
      gasto.descripcion.toLowerCase().includes(q) ||
      (gasto.comprobante ?? "").toLowerCase().includes(q) ||
      CATEGORIA_GASTO_LABEL[gasto.categoria].toLowerCase().includes(q)
    );
  });

  const total = gastos.reduce((sum, gasto) => sum + gasto.monto, 0);
  const recurrentesMes = gastosMes.filter((gasto) => gasto.recurrente);
  const totalRecurrente = recurrentesMes.reduce((sum, gasto) => sum + gasto.monto, 0);
  const totalMes = gastosMes.reduce((sum, gasto) => sum + gasto.monto, 0);
  const proporcionRecurrente = totalMes > 0 ? Math.round((totalRecurrente / totalMes) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Egresos · operación"
        title="Gastos operativos"
        description="Arriendo, servicios básicos, sueldos, comisiones, mantenimiento, publicidad y otros gastos menores del local."
        actions={
          <>
            <MonthPicker mes={mes} anio={anio} />
            <GastoDialog />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Total gastos del mes"
          value={money(totalMes)}
          hint="Egresos fijos y variables"
          icon={Wallet}
          tone="accent"
        />
        <SummaryStat
          label="Registros del mes"
          value={`${gastosMes.length}`}
          hint="Comprobantes y gastos menores"
          icon={Receipt}
        />
        <SummaryStat
          label="Gastos recurrentes"
          value={money(totalRecurrente)}
          hint={`${proporcionRecurrente}% del total mensual`}
          icon={Repeat}
          tone="navy"
        />
        <SummaryStat
          label="Categorías con gasto"
          value={`${new Set(gastosMes.map((gasto) => gasto.categoria)).size}`}
          hint="Distribución en el reporte mensual"
          icon={CalendarClock}
          tone="green"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
        <LedgerFilters
          basePath="/gastos"
          q={params.q}
          categoria={categoria}
          mes={mesParam}
          categories={CATEGORIA_GASTO_OPTIONS}
          placeholder="Buscar por descripción, comprobante o categoría…"
          categoriaLabel="Todas las categorías"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card xl:col-span-2">
          {gastos.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Sin gastos registrados"
              description="Registra los egresos operativos del mes para completar el flujo de caja."
              action={<GastoDialog />}
            />
          ) : (
            <>
              <TableWrap>
                <Table className="min-w-[700px]">
                  <TableHeader>
                    <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                      <TableHead className="pl-5 sm:pl-6">Fecha</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead className="pr-5 text-right sm:pr-6">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gastos.map((gasto) => (
                      <TableRow key={gasto.id} className="table-row-hover">
                        <TableCell className="whitespace-nowrap pl-5 text-[11.5px] text-ink-muted sm:pl-6">
                          {formatDate(gasto.fecha)}
                        </TableCell>
                        <TableCell>
                          <p className="max-w-[250px] truncate text-[12.5px] font-medium text-ink">
                            {gasto.descripcion}
                          </p>
                          {gasto.comprobante && (
                            <p className="text-[10px] text-ink-subtle">{gasto.comprobante}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {CATEGORIA_GASTO_LABEL[gasto.categoria as CategoriaGasto]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {gasto.recurrente ? (
                            <Badge variant="warning" className="gap-1">
                              <Repeat className="h-2.5 w-2.5" />
                              Recurrente
                            </Badge>
                          ) : (
                            <span className="text-[10.5px] text-ink-subtle">Variable</span>
                          )}
                        </TableCell>
                        <TableCell className="pr-5 text-right sm:pr-6">
                          <span className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-ink">
                            {money(gasto.monto)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableWrap>
              <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-3.5 text-[11px] text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p>
                  <span className="font-semibold text-ink">{gastos.length}</span> gastos mostrados
                </p>
                <span>
                  Total filtrado:{" "}
                  <strong className="tabular-nums text-ink">{money(total)}</strong>
                </span>
              </div>
            </>
          )}
        </div>

        <ExpenseBreakdown
          categorias={data.gastosCategorias}
          total={data.kpis.gastos}
        />
      </div>
    </div>
  );
}
