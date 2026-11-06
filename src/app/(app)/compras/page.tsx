import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Download,
  Package,
  PackagePlus,
  ShoppingBag,
  Truck,
} from "lucide-react";
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
import { CompraDialog } from "@/components/forms/compra-dialog";
import { getDataset } from "@/lib/data";
import {
  CATEGORIA_COMPRA_LABEL,
  CATEGORIA_COMPRA_OPTIONS,
} from "@/lib/constants";
import { formatDate, isInMonth, money, parseMonthParam } from "@/lib/format";
import type { CategoriaCompra } from "@/lib/types";

export const metadata: Metadata = { title: "Compras e inventario" };

export default async function ComprasPage({
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
  const comprasMes = dataset.compras.filter((compra) => isInMonth(compra.fecha, mes, anio));

  const compras = comprasMes.filter((compra) => {
    if (categoria !== "TODAS" && compra.categoria !== categoria) return false;
    if (!q) return true;
    return (
      compra.proveedor.toLowerCase().includes(q) ||
      compra.descripcion.toLowerCase().includes(q) ||
      (compra.numeroComprobante ?? "").toLowerCase().includes(q) ||
      (compra.proveedorRuc ?? "").toLowerCase().includes(q)
    );
  });

  const total = compras.reduce((sum, compra) => sum + compra.total, 0);
  const totalMes = comprasMes.reduce((sum, compra) => sum + compra.total, 0);
  const proveedores = new Set(comprasMes.map((compra) => compra.proveedor));
  const promedio = comprasMes.length ? totalMes / comprasMes.length : 0;

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Egresos · mercadería e insumos"
        title="Compras e inventario"
        description="Registra armazones, lunas enviadas a laboratorio, lentes de contacto, insumos y equipos con su proveedor y comprobante."
        actions={
          <>
            <MonthPicker mes={mes} anio={anio} />
            <Link
              href={`/api/reportes/export?mes=${mesParam}`}
              className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold text-ink-muted shadow-xs transition-colors hover:border-slate-300 hover:text-ink sm:inline-flex"
            >
              <Download className="h-3.5 w-3.5" />
              Exportar
            </Link>
            <CompraDialog />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Total compras del mes"
          value={money(totalMes)}
          hint="Mercadería, laboratorio e insumos"
          icon={ShoppingBag}
          tone="navy"
        />
        <SummaryStat
          label="Comprobantes registrados"
          value={`${comprasMes.length}`}
          hint="Facturas y notas de venta"
          icon={Package}
        />
        <SummaryStat
          label="Proveedores del mes"
          value={`${proveedores.size}`}
          hint="Laboratorios, importadoras e insumos"
          icon={Truck}
        />
        <SummaryStat
          label="Compra promedio"
          value={money(promedio)}
          hint="Ticket promedio por comprobante"
          icon={Building2}
          tone="accent"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
        <LedgerFilters
          basePath="/compras"
          q={params.q}
          categoria={categoria}
          mes={mesParam}
          categories={CATEGORIA_COMPRA_OPTIONS}
          placeholder="Buscar por proveedor, RUC, comprobante o detalle…"
          categoriaLabel="Todas las categorías"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        {compras.length === 0 ? (
          <EmptyState
            icon={PackagePlus}
            title="Sin compras registradas"
            description="Registra la compra de mercadería o el envío de lunas al laboratorio para este período."
            action={<CompraDialog />}
          />
        ) : (
          <>
            <TableWrap>
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                    <TableHead className="pl-5 sm:pl-6">Fecha</TableHead>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>Comprobante</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="pr-5 text-right sm:pr-6">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {compras.map((compra) => (
                    <TableRow key={compra.id} className="table-row-hover">
                      <TableCell className="whitespace-nowrap pl-5 text-[11.5px] text-ink-muted sm:pl-6">
                        {formatDate(compra.fecha)}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[200px] truncate text-[12.5px] font-medium text-ink">
                          {compra.proveedor}
                        </p>
                        {compra.proveedorRuc && (
                          <p className="text-[10px] text-ink-subtle">RUC {compra.proveedorRuc}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-[10.5px] text-ink-muted">
                          {compra.numeroComprobante ?? "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {CATEGORIA_COMPRA_LABEL[compra.categoria as CategoriaCompra]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[260px] truncate text-[12px] text-ink">
                          {compra.descripcion}
                        </p>
                      </TableCell>
                      <TableCell className="pr-5 text-right sm:pr-6">
                        <span className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-ink">
                          {money(compra.total)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableWrap>
            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-3.5 text-[11px] text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>
                Mostrando <span className="font-semibold text-ink">{compras.length}</span> compras
                del período
              </p>
              <span>
                Total filtrado:{" "}
                <strong className="tabular-nums text-ink">{money(total)}</strong>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
