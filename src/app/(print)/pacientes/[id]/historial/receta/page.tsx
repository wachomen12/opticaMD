import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, Glasses, Phone, ShieldCheck } from "lucide-react";
import { BrandMark } from "@/components/brand/logo";
import { LogoOpticaMD } from "@/components/brand/logo-optica-md";
import { PrintButton } from "@/components/clinical/print-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getHistoria, getHistoriasPaciente, getPaciente } from "@/lib/data";
import { RX_FILAS, parseNumeroHistoria } from "@/lib/clinical";
import { formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const paciente = await getPaciente(id);
  return {
    title: paciente
      ? `Receta de ${paciente.nombres} ${paciente.apellidos}`
      : "Receta optométrica",
    robots: { index: false, follow: false },
  };
}

function dato(value: string | null | undefined): string {
  return value?.trim() || "—";
}

export default async function RecetaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hc?: string }>;
}) {
  const { id } = await params;
  const { hc } = await searchParams;
  const paciente = await getPaciente(id);
  if (!paciente) notFound();

  const historia = hc
    ? await getHistoria(hc)
    : ((await getHistoriasPaciente(id))[0] ?? null);
  if (!historia || historia.pacienteId !== paciente.id) notFound();

  const diagnosticos = [
    ...historia.diagnosticos,
    ...(historia.diagnosticos.includes("Otro") && historia.diagnosticoOtro
      ? [historia.diagnosticoOtro]
      : []),
  ];
  const lentes = [
    ...historia.tipoLenteRecomendado.map((tipo) => `Lente ${tipo}`),
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
    <main className="mx-auto max-w-[840px] px-4 py-6 print:max-w-none print:p-0">
      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
        <Button asChild variant="outline">
          <Link href={`/pacientes/${paciente.id}/historial?hc=${historia.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Volver al historial
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="hidden sm:inline-flex">
            Vista de impresión
          </Badge>
          <PrintButton />
        </div>
      </div>

      <article className="receta-doc overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl print:rounded-none print:border-0 print:shadow-none">
        <div className="h-2 bg-gradient-to-r from-secondary via-primary to-accent" />

        <div className="px-7 py-6 sm:px-10 sm:py-8 print:px-9 print:py-7">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <LogoOpticaMD tone="dark" />
            <div className="sm:text-right">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-accent">
                Receta optométrica
              </p>
              <p className="mt-1 font-mono text-[15px] font-bold text-primary">
                {historia.numeroHistoria}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[10.5px] text-ink-muted sm:justify-end">
                <CalendarDays className="h-3 w-3" />
                {formatDate(historia.fecha)}
              </p>
            </div>
          </header>

          <section className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="text-[8.5px] font-bold uppercase tracking-[0.16em] text-ink-subtle">
                  Paciente
                </p>
                <p className="font-display text-[17px] font-bold text-ink">
                  {paciente.nombres} {paciente.apellidos}
                </p>
              </div>
              {paciente.cedula && (
                <p className="text-[10.5px] text-ink-muted">
                  CI / RUC <span className="font-semibold text-ink">{paciente.cedula}</span>
                </p>
              )}
            </div>
            <div className="mt-3 grid gap-x-6 gap-y-1.5 text-[10.5px] text-ink-muted sm:grid-cols-2">
              <p>
                <span className="font-semibold text-ink">Edad:</span>{" "}
                {paciente.edad ? `${paciente.edad} años` : "—"}
                {paciente.genero ? ` · ${paciente.genero}` : ""}
              </p>
              <p>
                <span className="font-semibold text-ink">Teléfono:</span> {paciente.telefono}
              </p>
              <p>
                <span className="font-semibold text-ink">Ocupación:</span>{" "}
                {dato(paciente.ocupacion)}
              </p>
              <p>
                <span className="font-semibold text-ink">Dirección:</span>{" "}
                {dato(paciente.direccion)}
              </p>
            </div>
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Uso de lentes
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink">
                {historia.usaLentes ? "Sí" : "No"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Último control
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink">
                {historia.ultimoControlVisual
                  ? formatDate(historia.ultimoControlVisual)
                  : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 px-3 py-2">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
                Último cambio de lentes
              </p>
              <p className="mt-0.5 text-[11px] font-semibold text-ink">
                {historia.ultimoCambioLentes ? formatDate(historia.ultimoCambioLentes) : "—"}
              </p>
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center gap-2">
              <Eye className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Diagnóstico optométrico
              </h2>
            </div>
            <div className="mt-2 rounded-lg border-l-[3px] border-l-accent bg-accent-50/40 px-4 py-2.5">
              <p className="text-[12px] font-semibold leading-relaxed text-ink">
                {diagnosticos.length > 0 ? diagnosticos.join(" · ") : "Sin diagnóstico registrado"}
              </p>
            </div>
          </section>

          <section className="mt-5">
            <div className="flex items-center gap-2">
              <Glasses className="h-3.5 w-3.5 text-primary" />
              <h2 className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                Prescripción óptica · RX final
              </h2>
            </div>
            <div className="mt-2 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full border-collapse text-[11.5px]">
                <thead>
                  <tr className="bg-secondary text-white">
                    <th className="px-3 py-2 text-left text-[9px] font-bold uppercase tracking-[0.12em]">
                      Parámetro
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] font-bold uppercase tracking-[0.12em]">
                      OD
                    </th>
                    <th className="px-3 py-2 text-center text-[9px] font-bold uppercase tracking-[0.12em]">
                      OI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RX_FILAS.map((fila, index) => (
                    <tr
                      key={fila.label}
                      className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}
                    >
                      <td className="border-t border-slate-100 px-3 py-2 font-semibold text-ink">
                        {fila.label}
                      </td>
                      <td className="border-t border-slate-100 px-3 py-2 text-center tabular-nums text-ink">
                        {dato(historia[fila.od])}
                      </td>
                      <td className="border-t border-slate-100 px-3 py-2 text-center tabular-nums text-ink">
                        {dato(historia[fila.oi])}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-primary">
                Tipo de lente recomendado
              </p>
              <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-ink">
                {lentes.length > 0 ? lentes.join(" · ") : "—"}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3.5">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-primary">
                Tratamientos y protecciones
              </p>
              <p className="mt-1 text-[11.5px] font-semibold leading-relaxed text-ink">
                {tratamientos.length > 0 ? tratamientos.join(" · ") : "—"}
              </p>
            </div>
          </section>

          {(historia.papilaOptica ||
            historia.macula ||
            historia.retina ||
            historia.observacionesSegmentoPosterior) && (
            <section className="mt-4 rounded-lg border border-slate-200 p-3.5">
              <p className="text-[8.5px] font-bold uppercase tracking-[0.14em] text-primary">
                Segmento posterior
              </p>
              <div className="mt-1.5 grid gap-1 text-[10.5px] text-ink-muted sm:grid-cols-3">
                <p>
                  <span className="font-semibold text-ink">Papila:</span>{" "}
                  {dato(historia.papilaOptica)}
                </p>
                <p>
                  <span className="font-semibold text-ink">Mácula:</span>{" "}
                  {dato(historia.macula)}
                </p>
                <p>
                  <span className="font-semibold text-ink">Retina:</span>{" "}
                  {dato(historia.retina)}
                </p>
              </div>
              {historia.observacionesSegmentoPosterior && (
                <p className="mt-1 text-[10.5px] text-ink-muted">
                  <span className="font-semibold text-ink">Observaciones:</span>{" "}
                  {historia.observacionesSegmentoPosterior}
                </p>
              )}
            </section>
          )}

          <footer className="mt-6 flex flex-col gap-5 border-t border-slate-200 pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="text-[9.5px] leading-relaxed text-ink-subtle">
              <p className="flex items-center gap-1.5 font-semibold text-ink-muted">
                <Phone className="h-3 w-3 text-primary/70" />
                ÓPTICA MD · Vemos por ti, cuidamos tu visión
              </p>
              <p className="mt-1 max-w-[320px]">
                Documento generado electrónicamente. Esta receta es válida para la elaboración de
                lentes según los valores indicados.
              </p>
              <p className="mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Control {parseNumeroHistoria(historia.numeroHistoria)} · {formatDate(historia.fecha)}
              </p>
            </div>
            <div className="w-full max-w-[240px] text-center">
              <BrandMark tone="dark" className="mx-auto h-8 w-8 opacity-70" />
              <div className="mt-2 border-t border-slate-300 pt-1.5">
                <p className="text-[10.5px] font-semibold text-ink">Dra. Mónica Díaz</p>
                <p className="text-[8.5px] uppercase tracking-[0.12em] text-ink-subtle">
                  Optometría · ÓPTICA MD
                </p>
              </div>
            </div>
          </footer>
        </div>
      </article>

      <p className="no-print mt-3 text-center text-[10px] text-ink-subtle">
        Usa el botón «Imprimir / Guardar PDF» y elige «Guardar como PDF» en el destino de impresión.
      </p>
    </main>
  );
}
