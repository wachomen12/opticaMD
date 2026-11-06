import type { Metadata } from "next";
import {
  ArrowDownRight,
  ArrowUpRight,
  Package,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { MonthPicker } from "@/components/ui/month-picker";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { CashflowChart } from "@/components/dashboard/cashflow-chart";
import { ExpenseBreakdown } from "@/components/dashboard/expense-breakdown";
import { CobranzaCard } from "@/components/dashboard/cobranza-card";
import { RecentMovements } from "@/components/dashboard/recent-movements";
import { VentaDialog } from "@/components/forms/venta-dialog";
import { CompraDialog } from "@/components/forms/compra-dialog";
import { GastoDialog } from "@/components/forms/gasto-dialog";
import { getDataset } from "@/lib/data";
import { getDashboardData, variacion } from "@/lib/accounting";
import { monthLabel, money, parseMonthParam } from "@/lib/format";

export const metadata: Metadata = { title: "Dashboard financiero" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>;
}) {
  const params = await searchParams;
  const { mes, anio } = parseMonthParam(params.mes);
  const dataset = await getDataset();
  const data = getDashboardData(dataset, mes, anio);
  const { kpis, anterior } = data;
  const pacientes = dataset.pacientes
    .filter((p) => p.activo)
    .map((p) => ({ id: p.id, nombres: p.nombres, apellidos: p.apellidos }));

  const recurrentes = dataset.gastos.filter(
    (g) => g.recurrente && new Date(g.fecha).getMonth() === mes && new Date(g.fecha).getFullYear() === anio,
  );

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow={`Resumen ejecutivo · ${monthLabel(mes, anio)}`}
        title="Control financiero mensual"
        description="Ventas, compras y gastos en una sola vista. La utilidad se calcula sobre los ingresos efectivamente cobrados."
        actions={
          <>
            <MonthPicker mes={mes} anio={anio} />
            <VentaDialog pacientes={pacientes} />
            <CompraDialog
              trigger={
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 sm:px-3.5">
                  <Package className="h-4 w-4 text-primary" />
                  <span className="hidden sm:inline">Compra</span>
                </button>
              }
            />
            <GastoDialog
              trigger={
                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink shadow-xs transition-colors hover:border-slate-300 hover:bg-slate-50 sm:px-3.5">
                  <Wallet className="h-4 w-4 text-accent" />
                  <span className="hidden sm:inline">Gasto</span>
                </button>
              }
            />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <KpiCard
          label="Total ventas del mes"
          value={money(kpis.ventas)}
          icon={Receipt}
          delta={variacion(kpis.ventas, anterior.ventas)}
          hint={
            <span className="flex flex-wrap items-center gap-x-1">
              Cobrado <strong className="text-emerald-600">{money(kpis.cobrado)}</strong>
              <span className="text-slate-300">·</span>
              Por cobrar <strong className="text-accent-700">{money(kpis.porCobrarMes)}</strong>
            </span>
          }
        />
        <KpiCard
          label="Total compras"
          value={money(kpis.compras)}
          icon={ShoppingBag}
          delta={variacion(kpis.compras, anterior.compras)}
          positiveIsGood={false}
          hint={`${dataset.compras.filter((c) => new Date(c.fecha).getMonth() === mes && new Date(c.fecha).getFullYear() === anio).length} compras a proveedores y laboratorios`}
        />
        <KpiCard
          label="Total gastos operativos"
          value={money(kpis.gastos)}
          icon={Wallet}
          delta={variacion(kpis.gastos, anterior.gastos)}
          positiveIsGood={false}
          hint={`${recurrentes.length} gastos recurrentes del mes`}
        />
        <KpiCard
          label="Utilidad neta del mes"
          value={money(kpis.utilidad)}
          icon={TrendingUp}
          delta={variacion(kpis.utilidad, anterior.utilidad)}
          hero
          hint={
            <span className="flex flex-wrap items-center gap-x-1.5">
              Margen <strong className="text-accent-300">{kpis.margen.toFixed(1)}%</strong>
              <span className="text-white/25">·</span>
              Cobrado − compras − gastos
            </span>
          }
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <CashflowChart series={data.series} />
        </div>
        <CobranzaCard
          kpis={kpis}
          porCobrarTotal={data.porCobrarTotal}
          enTaller={data.enTaller}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 xl:col-span-2">
          <RecentMovements movimientos={data.movimientos} />
        </div>
        <ExpenseBreakdown categorias={data.gastosCategorias} total={kpis.gastos} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary">
            <Receipt className="h-4 w-4" />
          </span>
          <p className="text-[11.5px] text-ink-muted">
            Ticket promedio{" "}
            <span className="block font-display text-[15px] font-bold tabular-nums text-ink">
              {money(kpis.ticket)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft text-emerald-600">
            <ArrowUpRight className="h-4 w-4" />
          </span>
          <p className="text-[11.5px] text-ink-muted">
            Ventas registradas{" "}
            <span className="block font-display text-[15px] font-bold tabular-nums text-ink">
              {kpis.count} en el mes
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-600">
            <ArrowDownRight className="h-4 w-4" />
          </span>
          <p className="text-[11.5px] text-ink-muted">
            Clientes activos{" "}
            <span className="block font-display text-[15px] font-bold tabular-nums text-ink">
              {data.clientesActivos} pacientes
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
