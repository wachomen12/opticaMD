import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeDollarSign,
  Banknote,
  Download,
  FlaskConical,
  HandCoins,
  MessageCircle,
  Printer,
  Receipt,
  Ticket,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MonthPicker } from "@/components/ui/month-picker";
import { LedgerFilters } from "@/components/ui/ledger-filters";
import { SummaryStat } from "@/components/ui/summary-stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { VentaDialog } from "@/components/forms/venta-dialog";
import { PagoDialog } from "@/components/forms/pago-dialog";
import { EntregaControl } from "@/components/forms/entrega-control";
import { getDataset, getHistoriasVinculadas } from "@/lib/data";
import { getDashboardData, ventaPagado, ventaSaldo } from "@/lib/accounting";
import {
  enlaceWhatsApp,
  mensajeComprobantePedido,
  mensajeLentesListos,
} from "@/lib/whatsapp";
import {
  CATEGORIA_VENTA_DOT,
  CATEGORIA_VENTA_LABEL,
  CATEGORIA_VENTA_OPTIONS,
  ESTADO_PAGO_LABEL,
  ESTADO_PAGO_STYLE,
} from "@/lib/constants";
import { formatDate, isInMonth, money, parseMonthParam } from "@/lib/format";
import type { EstadoPago, CategoriaVenta } from "@/lib/types";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Ventas" };

export default async function VentasPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; q?: string; categoria?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const { mes, anio } = parseMonthParam(params.mes);
  const q = (params.q ?? "").trim().toLowerCase();
  const categoria = params.categoria ?? "TODAS";
  const estado = params.estado ?? "TODAS";
  const mesParam = `${anio}-${String(mes + 1).padStart(2, "0")}`;

  const dataset = await getDataset();
  const historiasVinculadas = await getHistoriasVinculadas();
  const historiaPorVenta = new Map(
    historiasVinculadas
      .filter((historia) => Boolean(historia.ventaId))
      .map((historia) => [historia.ventaId as string, historia]),
  );
  const metrics = getDashboardData(dataset, mes, anio).kpis;
  const pacientes = new Map(dataset.pacientes.map((p) => [p.id, p]));
  const pacientesActivos = dataset.pacientes
    .filter((p) => p.activo)
    .map((p) => ({ id: p.id, nombres: p.nombres, apellidos: p.apellidos }));

  const ventas = dataset.ventas.filter((venta) => {
    if (!isInMonth(venta.fecha, mes, anio)) return false;
    if (categoria !== "TODAS" && venta.categoria !== categoria) return false;
    if (estado !== "TODAS" && venta.estadoPago !== estado) return false;
    if (!q) return true;
    const paciente = venta.pacienteId ? pacientes.get(venta.pacienteId) : undefined;
    const cliente = paciente
      ? `${paciente.nombres} ${paciente.apellidos} ${paciente.cedula}`
      : venta.clienteNombre ?? "";
    return (
      venta.codigo.toLowerCase().includes(q) ||
      venta.descripcion.toLowerCase().includes(q) ||
      cliente.toLowerCase().includes(q)
    );
  });

  const totalFiltrado = ventas.reduce((sum, v) => sum + v.total, 0);
  const saldoFiltrado = ventas.reduce((sum, v) => sum + ventaSaldo(v), 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Ingresos y cuentas por cobrar"
        title="Registro de ventas"
        description="Lunas, armazones, lentes de contacto, accesorios y consultas. Controla abonos, saldos pendientes y estado de entrega."
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
            <VentaDialog pacientes={pacientesActivos} />
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Facturado en el mes"
          value={money(metrics.ventas)}
          hint={`${metrics.count} ventas registradas`}
          icon={Receipt}
        />
        <SummaryStat
          label="Cobrado en el mes"
          value={money(metrics.cobrado)}
          hint="Incluye abonos de meses anteriores"
          icon={Banknote}
          tone="green"
        />
        <SummaryStat
          label="Por cobrar de este mes"
          value={money(metrics.porCobrarMes)}
          hint="Saldos pendientes de recaudar"
          icon={HandCoins}
          tone="accent"
        />
        <SummaryStat
          label="Ticket promedio"
          value={money(metrics.ticket)}
          hint={`Margen del mes: ${metrics.margen.toFixed(1)}%`}
          icon={Ticket}
          tone="navy"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
        <LedgerFilters
          basePath="/ventas"
          q={params.q}
          categoria={categoria}
          estado={estado}
          mes={mesParam}
          categories={CATEGORIA_VENTA_OPTIONS}
          estadoOptions={[
            { value: "PENDIENTE", label: "Pendiente" },
            { value: "PARCIAL", label: "Abonado" },
            { value: "PAGADA", label: "Pagada" },
          ]}
          placeholder="Buscar por cliente, comprobante o detalle…"
          categoriaLabel="Todas las categorías"
          estadoLabel="Todos los estados"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        {ventas.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No hay ventas con estos filtros"
            description="Prueba con otro mes o categoría, o registra la primera venta del período."
            action={<VentaDialog pacientes={pacientesActivos} />}
          />
        ) : (
          <>
            <TableWrap>
              <Table className="min-w-[1080px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                    <TableHead className="pl-5 sm:pl-6">Comprobante</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Detalle</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead>Estado de pago</TableHead>
                    <TableHead>Estado de entrega</TableHead>
                    <TableHead className="pr-2 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ventas.map((venta) => {
                    const paciente = venta.pacienteId ? pacientes.get(venta.pacienteId) : undefined;
                    const cliente = paciente
                      ? `${paciente.nombres} ${paciente.apellidos}`
                      : venta.clienteNombre || "Cliente ocasional";
                    const saldo = ventaSaldo(venta);
                    const pagado = ventaPagado(venta);
                    const color = CATEGORIA_VENTA_DOT[venta.categoria];
                    const historia = historiaPorVenta.get(venta.id);
                    const lentesListos =
                      venta.estadoEntrega === "LISTO" ||
                      venta.estadoEntrega === "ENTREGADO";
                    const nombreWhatsApp =
                      paciente?.nombres ||
                      venta.clienteNombre?.trim().split(/\s+/)[0] ||
                      "estimado cliente";
                    const mensajeWhatsApp = lentesListos
                      ? mensajeLentesListos({ nombre: nombreWhatsApp, saldo })
                      : mensajeComprobantePedido({
                          nombre: nombreWhatsApp,
                          descripcion: venta.descripcion,
                          total: venta.total,
                          abono: pagado,
                          saldo,
                        });
                    const whatsapp = paciente?.telefono
                      ? enlaceWhatsApp(paciente.telefono, mensajeWhatsApp)
                      : null;
                    return (
                      <TableRow key={venta.id} className="table-row-hover">
                        <TableCell className="pl-5 sm:pl-6">
                          <p className="font-mono text-[10.5px] font-semibold tracking-tight text-primary">
                            {venta.codigo}
                          </p>
                          <p className="mt-0.5 whitespace-nowrap text-[10.5px] text-ink-subtle">
                            {formatDate(venta.fecha)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="max-w-[150px] truncate text-[12.5px] font-medium text-ink">
                            {cliente}
                          </p>
                          {paciente && (
                            <p className="text-[10px] text-ink-subtle">{paciente.cedula}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="max-w-[210px] truncate text-[12px] text-ink">
                            {venta.descripcion}
                          </p>
                          <span className="mt-1 inline-flex items-center gap-1.5 text-[9.5px] font-medium text-ink-subtle">
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            {CATEGORIA_VENTA_LABEL[venta.categoria as CategoriaVenta]}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="whitespace-nowrap text-[12.5px] font-semibold tabular-nums text-ink">
                            {money(venta.total)}
                          </p>
                          <p className="text-[9.5px] tabular-nums text-ink-subtle">
                            Abonado {money(pagado)}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "whitespace-nowrap text-[12px] font-semibold tabular-nums",
                              saldo > 0 ? "text-accent-700" : "text-emerald-600",
                            )}
                          >
                            {money(saldo)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "ring-1",
                              ESTADO_PAGO_STYLE[venta.estadoPago as EstadoPago],
                            )}
                          >
                            {ESTADO_PAGO_LABEL[venta.estadoPago as EstadoPago]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <EntregaControl ventaId={venta.id} estado={venta.estadoEntrega} />
                        </TableCell>
                        <TableCell className="pr-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/ventas/${venta.id}/recibo`}
                              target="_blank"
                              title="Recibo de venta / abono"
                              aria-label="Recibo de venta / abono"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-muted transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </Link>
                            {historia && (
                              <Link
                                href={`/ventas/${venta.id}/orden-laboratorio`}
                                target="_blank"
                                title={`Orden de laboratorio ${historia.numeroHistoria}`}
                                aria-label="Orden de laboratorio"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-muted transition-colors hover:border-primary-200 hover:bg-primary-50 hover:text-primary"
                              >
                                <FlaskConical className="h-3.5 w-3.5" />
                              </Link>
                            )}
                            {whatsapp && (
                              <a
                                href={whatsapp}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={
                                  lentesListos
                                    ? "Avisar por WhatsApp que los lentes están listos"
                                    : "Enviar comprobante de pedido por WhatsApp"
                                }
                                aria-label={
                                  lentesListos
                                    ? "Avisar por WhatsApp que los lentes están listos"
                                    : "Enviar comprobante de pedido por WhatsApp"
                                }
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-white text-emerald-600 transition-colors hover:bg-emerald-50"
                              >
                                <MessageCircle className="h-3.5 w-3.5" />
                              </a>
                            )}
                            {saldo > 0 ? (
                              <PagoDialog
                                ventaId={venta.id}
                                codigo={venta.codigo}
                                saldo={saldo}
                                trigger={
                                  <Button
                                    variant="outline"
                                    size="icon-sm"
                                    title="Registrar abono"
                                    aria-label="Registrar abono"
                                  >
                                    <HandCoins className="h-3.5 w-3.5" />
                                  </Button>
                                }
                              />
                            ) : (
                              <span
                                title="Venta cobrada"
                                aria-label="Venta cobrada"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/60 text-emerald-600"
                              >
                                <BadgeDollarSign className="h-3.5 w-3.5" />
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
            <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-3.5 text-[11px] text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p>
                Mostrando <span className="font-semibold text-ink">{ventas.length}</span> ventas
                {categoria !== "TODAS" && ` · ${CATEGORIA_VENTA_LABEL[categoria as CategoriaVenta]}`}
                {estado !== "TODAS" && ` · ${ESTADO_PAGO_LABEL[estado as EstadoPago]}`}
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  Total filtrado:{" "}
                  <strong className="tabular-nums text-ink">{money(totalFiltrado)}</strong>
                </span>
                <span>
                  Saldo:{" "}
                  <strong className="tabular-nums text-accent-700">{money(saldoFiltrado)}</strong>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
