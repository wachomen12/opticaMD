import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, FlaskConical, Phone } from "lucide-react";
import { LogoOpticaMD } from "@/components/brand/logo-optica-md";
import { PrintButton } from "@/components/clinical/print-button";
import { getHistoriaPorVenta, getPaciente, getVenta } from "@/lib/data";
import { RX_FILAS } from "@/lib/clinical";
import { formatDate } from "@/lib/format";

const FILAS_TALLER = RX_FILAS.filter((fila) => fila.label !== "AV final");

function dato(value: string | null | undefined): string {
  return value?.trim() || "—";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const venta = await getVenta(id);
  return {
    title: venta ? `Orden de laboratorio ${venta.codigo}` : "Orden de laboratorio",
    robots: { index: false, follow: false },
  };
}

export default async function OrdenLaboratorioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const venta = await getVenta(id);
  if (!venta) notFound();

  const historia = await getHistoriaPorVenta(venta.id);
  if (!historia) notFound();

  const paciente = venta.pacienteId ? await getPaciente(venta.pacienteId) : null;
  const nombre = paciente
    ? `${paciente.nombres} ${paciente.apellidos}`
    : venta.clienteNombre || "Cliente ocasional";

  const lentes = [
    ...historia.tipoLenteRecomendado,
    ...(historia.tipoLenteRecomendado.includes("Otro") && historia.tipoLenteOtro
      ? [historia.tipoLenteOtro]
      : []),
  ];
  const tratamientos = [
    ...historia.tratamientosRecomendados,
    ...(historia.tratamientosRecomendados.includes("Otro") && historia.tratamientoOtro
      ? [historia.tratamientoOtro]
      : []),
  ];

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
        <PrintButton label="Imprimir orden / PDF" />
      </div>

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
        <div className="h-1.5 bg-gradient-to-r from-secondary via-primary to-accent" />

        <div className="px-6 py-5 sm:px-8 sm:py-6 print:px-0 print:py-0">
          <header className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <LogoOpticaMD tone="dark" imgClassName="h-10" />
            <div className="text-right">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-accent">
                Orden de laboratorio
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
              <p className="font-mono text-[10.5px] font-semibold text-primary">
                {historia.numeroHistoria}
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[10px] text-ink-muted">
              {paciente?.cedula && <span>CI / RUC {paciente.cedula}</span>}
              {paciente?.telefono && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3 text-primary/70" />
                  {paciente.telefono}
                </span>
              )}
            </div>
          </section>

          <section className="mt-4">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5 text-primary" />
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-primary">
                Medidas técnicas para taller
              </p>
            </div>
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-secondary text-white">
                    <th className="px-3 py-2 text-left text-[8.5px] font-bold uppercase tracking-[0.12em]">
                      Parámetro
                    </th>
                    <th className="px-3 py-2 text-center text-[8.5px] font-bold uppercase tracking-[0.12em]">
                      OD
                    </th>
                    <th className="px-3 py-2 text-center text-[8.5px] font-bold uppercase tracking-[0.12em]">
                      OI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {FILAS_TALLER.map((fila, index) => (
                    <tr key={fila.label} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                      <td className="border-t border-slate-100 px-3 py-2 font-semibold text-ink">
                        {fila.label}
                      </td>
                      <td className="border-t border-slate-100 px-3 py-2 text-center font-medium tabular-nums text-ink">
                        {dato(historia[fila.od])}
                      </td>
                      <td className="border-t border-slate-100 px-3 py-2 text-center font-medium tabular-nums text-ink">
                        {dato(historia[fila.oi])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-4 grid gap-2.5 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 px-3.5 py-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-primary">
                Tipo de lente
              </p>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink">
                {lentes.length > 0 ? lentes.join(" · ") : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 px-3.5 py-3">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-primary">
                Tratamientos y protecciones
              </p>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-ink">
                {tratamientos.length > 0 ? tratamientos.join(" · ") : "—"}
              </p>
            </div>
          </section>

          <p className="mt-4 rounded-lg border border-dashed border-slate-300 px-3.5 py-2 text-[9px] leading-relaxed text-ink-subtle">
            Documento exclusivo para el laboratorio óptico / taller. Contiene únicamente
            especificaciones técnicas, sin valores comerciales.
          </p>

          <footer className="mt-5 flex items-end justify-between gap-4 border-t border-slate-200 pt-4">
            <p className="text-[8.5px] leading-relaxed text-ink-subtle">
              <span className="font-semibold text-ink-muted">ÓPTICA MD</span>
              <br />
              Vemos por ti, cuidamos tu visión.
            </p>
            <div className="text-right">
              <div className="w-36 border-t border-slate-300 pt-1 text-[8.5px] text-ink-subtle">
                Recibido por taller
              </div>
            </div>
          </footer>
        </div>
      </article>

      <p className="no-print mt-3 text-center text-[10px] text-ink-subtle">
        Imprime esta orden y entrégala al laboratorio junto con el armazón.
      </p>
    </main>
  );
}
