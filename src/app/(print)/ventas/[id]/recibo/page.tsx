import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, CreditCard, Phone, Printer } from "lucide-react";
import { LogoOpticaMD } from "@/components/brand/logo-optica-md";
import { PrintButton } from "@/components/clinical/print-button";
import { getHistoriaPorVenta, getPaciente, getVenta } from "@/lib/data";
import { ventaPagado, ventaSaldo } from "@/lib/accounting";
import {
  CATEGORIA_VENTA_LABEL,
  ESTADO_ENTREGA_LABEL,
  ESTADO_PAGO_LABEL,
  METODO_PAGO_LABEL,
} from "@/lib/constants";
import { formatDate, money } from "@/lib/format";
import type { CategoriaVenta, EstadoEntrega, EstadoPago, MetodoPago } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const venta = await getVenta(id);
  return {
    title: venta ? `Recibo ${venta.codigo}` : "Recibo de venta",
    robots: { index: false, follow: false },
  };
}

export default async function ReciboPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venta = await getVenta(id);
  if (!venta) notFound();

  const [paciente, historia] = await Promise.all([
    venta.pacienteId ? getPaciente(venta.pacienteId) : Promise.resolve(null),
    getHistoriaPorVenta(venta.id),
  ]);
  const pagado = ventaPagado(venta);
  const saldo = ventaSaldo(venta);
  const nombre = paciente
    ? `${paciente.nombres} ${paciente.apellidos}`
    : venta.clienteNombre || "Cliente ocasional";

  return (
    <main className="mx-auto w-full max-w-[620px] px-4 py-6 print:max-w-none print:p-0">
      <style>{`@media print { @page { size: A5 portrait; margin: 8mm; } }`}</style>

      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/ventas"
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-[12px] font-semibold text-ink-muted shadow-xs transition-colors hover:border-slate-300 hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a ventas
        </Link>
        <PrintButton label="Imprimir recibo / PDF" />
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
        <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-accent" />

        <div className="px-6 py-5 sm:px-8 sm:py-6 print:px-0 print:py-0">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <LogoOpticaMD tone="dark" imgClassName="h-10" />
            <div className="text-right">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-accent">
                Recibo de venta
              </p>
              <p className="mt-1 font-mono text-[14px] font-bold text-primary">{venta.codigo}</p>
              <p className="mt-0.5 flex items-center justify-end gap-1.5 text-[9.5px] text-ink-muted">
                <CalendarDays className="h-3 w-3" />
                {formatDate(venta.fecha)}
              </p>
            </div>
          </header>

          <section className="mt-4 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
                  Paciente
                </p>
                <p className="font-display text-[15px] font-bold text-ink">{nombre}</p>
              </div>
              {paciente?.cedula && (
                <p className="text-[10px] text-ink-muted">
                  CI / RUC <span className="font-semibold text-ink">{paciente.cedula}</span>
                </p>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-ink-muted">
              {paciente?.telefono && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-primary/70" />
                  {paciente.telefono}
                </span>
              )}
              {paciente?.direccion && <span>{paciente.direccion}</span>}
              {historia && (
                <span className="font-mono font-semibold text-primary">
                  {historia.numeroHistoria}
                </span>
              )}
            </div>
          </section>

          <section className="mt-4">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
              Detalle del trabajo
            </p>
            <div className="mt-1.5 rounded-lg border border-slate-200 px-3.5 py-3">
              <p className="text-[11.5px] font-semibold leading-relaxed text-ink">
                {venta.descripcion}
              </p>
              <p className="mt-1 text-[9.5px] text-ink-subtle">
                {CATEGORIA_VENTA_LABEL[venta.categoria as CategoriaVenta]}
                {" · "}
                {ESTADO_PAGO_LABEL[venta.estadoPago as EstadoPago]}
              </p>
            </div>
          </section>

          <section className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-3.5 py-2 text-[10px] text-ink-muted">
              <span>Valor total</span>
              <span className="font-semibold tabular-nums text-ink">{money(venta.total)}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-100 px-3.5 py-2 text-[10px] text-ink-muted">
              <span>Abono pagado</span>
              <span className="font-semibold tabular-nums text-emerald-600">{money(pagado)}</span>
            </div>
            <div className="flex items-center justify-between bg-accent-50/70 px-3.5 py-2.5">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-accent-800">
                Saldo pendiente por pagar
              </span>
              <span className="font-display text-[16px] font-bold tabular-nums text-accent-800">
                {money(saldo)}
              </span>
            </div>
          </section>

          <section className="mt-4 grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Estado de entrega
              </p>
              <p className="mt-0.5 text-[10.5px] font-semibold text-ink">
                {ESTADO_ENTREGA_LABEL[venta.estadoEntrega as EstadoEntrega]}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-[7.5px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Método de pago
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10.5px] font-semibold text-ink">
                <CreditCard className="h-3 w-3 text-primary/70" />
                {METODO_PAGO_LABEL[venta.metodoPago as MetodoPago]}
              </p>
            </div>
          </section>

          {venta.pagos.length > 0 && (
            <section className="mt-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
                Abonos registrados
              </p>
              <div className="mt-1.5 divide-y divide-slate-100 rounded-lg border border-slate-200">
                {venta.pagos.map((pago) => (
                  <div
                    key={pago.id}
                    className="flex items-center justify-between gap-3 px-3 py-1.5 text-[9.5px] text-ink-muted"
                  >
                    <span>
                      {formatDate(pago.fecha)} · {METODO_PAGO_LABEL[pago.metodo]}
                      {pago.nota ? ` · ${pago.nota}` : ""}
                    </span>
                    <span className="font-semibold tabular-nums text-ink">{money(pago.monto)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <footer className="mt-5 flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
            <div className="text-[8.5px] leading-relaxed text-ink-subtle">
              <p className="font-semibold text-ink-muted">
                ÓPTICA MD · Vemos por ti, cuidamos tu visión
              </p>
              <p className="mt-1 max-w-[280px]">
                Comprobante interno de venta y abonos. Conserve este documento para
                cualquier consulta sobre su pedido.
              </p>
            </div>
            <div className="text-right">
              <div className="mb-1 flex items-center justify-end gap-1 text-[8px] text-ink-subtle">
                <Printer className="h-3 w-3" />
                Documento imprimible
              </div>
              <div className="w-32 border-t border-slate-300 pt-1 text-[8.5px] text-ink-subtle">
                Firma / sello
              </div>
            </div>
          </footer>
        </div>
      </article>

      <p className="no-print mt-3 text-center text-[10px] text-ink-subtle">
        Puedes imprimir en A5 o guardar como PDF desde el diálogo de impresión.
      </p>
    </main>
  );
}
