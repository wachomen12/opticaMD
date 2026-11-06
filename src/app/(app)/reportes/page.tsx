import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileSpreadsheet, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MonthPicker } from "@/components/ui/month-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryStat } from "@/components/ui/summary-stat";
import { PrintButton } from "@/components/reports/print-button";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { Logo } from "@/components/brand/logo";
import { getDataset } from "@/lib/data";
import { getDashboardData, type CategoriaTotal } from "@/lib/accounting";
import { monthLabel, money, parseMonthParam, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reportes contables" };

function StatementRow({
  label,
  value,
  variant = "normal",
  hint,
}: {
  label: string;
  value: number;
  variant?: "normal" | "negative" | "total" | "subtle";
  hint?: string;
}) {
  const negative = value < 0;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 py-2",
        variant === "total" && "border-t border-slate-200 pt-3",
      )}
    >
      <span
        className={cn(
          "text-[12px]",
          variant === "total"
            ? "font-semibold text-ink"
            : variant === "subtle"
              ? "text-ink-subtle"
              : "text-ink-muted",
        )}
      >
        {label}
        {hint && <span className="ml-1 text-[10px] text-ink-subtle">{hint}</span>}
      </span>
      <span
        className={cn(
          "whitespace-nowrap text-[12.5px] font-semibold tabular-nums",
          variant === "total"
            ? negative
              ? "text-red-600"
              : "text-emerald-600"
            : negative
              ? "text-red-500"
              : variant === "negative"
                ? "text-ink-muted"
                : "text-ink",
        )}
      >
        {money(value)}
      </span>
    </div>
  );
}

function CategoryTable({
  titulo,
  descripcion,
  categorias,
  total,
  colorFondo = "bg-primary",
}: {
  titulo: string;
  descripcion: string;
  categorias: CategoriaTotal[];
  total: number;
  colorFondo?: string;
}) {
  return (
    <Card className="print-full">
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
        <CardDescription>{descripcion}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {categorias.length === 0 && (
          <p className="py-4 text-center text-[12px] text-ink-subtle">Sin registros en el período.</p>
        )}
        {categorias.map((categoria) => {
          const pct = percent(categoria.total, total);
          return (
            <div key={categoria.key}>
              <div className="flex items-center justify-between gap-2 text-[11.5px]">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: categoria.color }}
                  />
                  <span className="truncate text-ink-muted">{categoria.label}</span>
                  <span className="text-[9.5px] text-ink-subtle">({categoria.count})</span>
                </span>
                <span className="shrink-0 font-semibold tabular-nums text-ink">
                  {money(categoria.total)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn("h-full rounded-full", colorFondo)}
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <span className="w-7 text-right text-[9px] tabular-nums text-ink-subtle">{pct}%</span>
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11.5px]">
          <span className="font-medium text-ink-muted">Total</span>
          <span className="font-display text-[14px] font-bold tabular-nums text-ink">
            {money(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const params = await searchParams;
  const { mes, anio } = parseMonthParam(params.mes);
  const mesParam = `${anio}-${String(mes + 1).padStart(2, "0")}`;

  const dataset = await getDataset();
  const data = getDashboardData(dataset, mes, anio);
  const { kpis } = data;
  const utilidadFacturada = kpis.ventas - kpis.compras - kpis.gastos;
  const hoy = new Date().toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={`Cierre contable · ${monthLabel(mes, anio)}`}
        title="Reportes contables mensuales"
        description="Estado de resultados y flujo de caja del período. Exporta el libro de movimientos a CSV o imprímelo para archivo."
        actions={
          <>
            <MonthPicker mes={mes} anio={anio} />
            <PrintButton />
            <Link
              href={`/api/reportes/export?mes=${mesParam}`}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[12px] font-semibold text-white shadow-sm transition-colors hover:bg-primary-700"
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </Link>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat label="Ventas facturadas" value={money(kpis.ventas)} icon={FileSpreadsheet} />
        <SummaryStat
          label="Ingresos cobrados"
          value={money(kpis.cobrado)}
          icon={TrendingUp}
          tone="green"
          hint="Base para la utilidad del dashboard"
        />
        <SummaryStat
          label="Egresos del mes"
          value={money(kpis.compras + kpis.gastos)}
          icon={TrendingDown}
          tone="accent"
          hint={`Compras ${money(kpis.compras)} · Gastos ${money(kpis.gastos)}`}
        />
        <SummaryStat
          label="Utilidad neta (cobrada)"
          value={money(kpis.utilidad)}
          icon={Wallet}
          tone={kpis.utilidad >= 0 ? "green" : "accent"}
          hint={`Margen ${kpis.margen.toFixed(1)}%`}
        />
      </div>

      <div className="print-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-4">
            <Logo tone="dark" />
            <div className="hidden h-10 w-px bg-slate-200 sm:block" />
            <div className="hidden sm:block">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
                Documento contable
              </p>
              <p className="font-display text-[14px] font-semibold text-ink">
                {monthLabel(mes, anio)}
              </p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
              Reporte mensual
            </p>
            <p className="mt-0.5 text-[11px] text-ink-muted">Emitido el {hoy}</p>
            <p className="text-[10px] text-ink-subtle">
              ÓPTICA MD · RUC 1790000000001 · Quito, Ecuador
            </p>
          </div>
        </div>

        <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0">
          <div className="p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-50 text-primary">
                <TrendingUp className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-display text-[13px] font-semibold text-ink">Flujo de caja</p>
                <p className="text-[10px] text-ink-subtle">Base cobrada · movimiento real de dinero</p>
              </div>
            </div>
            <StatementRow label="Ingresos cobrados del mes" value={kpis.cobrado} />
            <StatementRow label="Compras de mercadería e insumos" value={-kpis.compras} variant="negative" />
            <StatementRow label="Gastos operativos" value={-kpis.gastos} variant="negative" />
            <StatementRow label="Utilidad neta del mes" value={kpis.utilidad} variant="total" />
            <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[10px] leading-relaxed text-ink-subtle">
              Incluye abonos recibidos en el mes por ventas de períodos anteriores. La utilidad se
              calcula como <strong>cobrado − compras − gastos</strong>.
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
                <FileSpreadsheet className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="font-display text-[13px] font-semibold text-ink">Resultado del período</p>
                <p className="text-[10px] text-ink-subtle">Base facturada · devengado</p>
              </div>
            </div>
            <StatementRow label="Ventas facturadas del mes" value={kpis.ventas} />
            <StatementRow label="Compras de mercadería e insumos" value={-kpis.compras} variant="negative" />
            <StatementRow label="Gastos operativos" value={-kpis.gastos} variant="negative" />
            <StatementRow label="Utilidad operativa" value={utilidadFacturada} variant="total" />
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200 pt-2">
              <span className="text-[11px] text-ink-subtle">Cuentas por cobrar del mes</span>
              <span className="text-[12px] font-semibold tabular-nums text-accent-700">
                {money(kpis.porCobrarMes)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <CategoryTable
          titulo="Ventas por categoría"
          descripcion="Participación de cada línea de negocio."
          categorias={data.ventasCategorias}
          total={kpis.ventas}
          colorFondo="bg-primary"
        />
        <CategoryTable
          titulo="Compras por categoría"
          descripcion="Destino de la mercadería adquirida."
          categorias={data.comprasCategorias}
          total={kpis.compras}
          colorFondo="bg-sky-500"
        />
        <CategoryTable
          titulo="Gastos por categoría"
          descripcion="Estructura de los egresos operativos."
          categorias={data.gastosCategorias}
          total={kpis.gastos}
          colorFondo="bg-accent"
        />
      </div>

      <RecentMovements
        movimientos={data.movimientos}
        titulo="Libro de movimientos del mes"
        descripcion="Detalle cronológico de ventas, compras y gastos para conciliación bancaria."
        limite={1000}
        href="/ventas"
        hrefLabel="Ir a ventas"
      />

      <div className="print-full rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
        <p className="mb-2 font-display text-[13px] font-semibold text-ink">Notas de cierre</p>
        <ul className="space-y-1.5 text-[11px] leading-relaxed text-ink-muted">
          <li>• Los valores se expresan en dólares de los Estados Unidos (USD).</li>
          <li>
            • El flujo de caja considera únicamente pagos registrados en el mes, independientemente
            de la fecha de la venta.
          </li>
          <li>
            • Las cuentas por cobrar corresponden a saldos pendientes de ventas facturadas en el
            período seleccionado.
          </li>
          <li>
            • Documento generado automáticamente por el sistema de gestión de ÓPTICA MD.
          </li>
        </ul>
      </div>
    </div>
  );
}
