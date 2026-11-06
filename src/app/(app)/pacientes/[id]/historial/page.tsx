import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FileHeart,
  IdCard,
  Phone,
  Plus,
  Printer,
  Receipt,
  UserRound,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { HistorialWizard } from "@/components/clinical/historial-wizard";
import { VentaDialog } from "@/components/forms/venta-dialog";
import { getDataset, getHistoriasPaciente, getPaciente } from "@/lib/data";
import { resumenReceta } from "@/lib/clinical";
import { formatDate, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const paciente = await getPaciente(id);
  return {
    title: paciente
      ? `Historial de ${paciente.nombres} ${paciente.apellidos}`
      : "Historial clínico",
  };
}

export default async function HistorialPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ hc?: string; nueva?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const [paciente, historias, dataset] = await Promise.all([
    getPaciente(id),
    getHistoriasPaciente(id),
    getDataset(),
  ]);
  if (!paciente) notFound();

  const solicitada = query.hc ? historias.find((historia) => historia.id === query.hc) : null;
  const esNueva = query.nueva === "1" || historias.length === 0;
  const historia = esNueva ? null : (solicitada ?? historias[0] ?? null);
  const ventaAsociada = historia?.ventaId
    ? dataset.ventas.find((venta) => venta.id === historia.ventaId)
    : null;
  const pacientesActivos = dataset.pacientes
    .filter((item) => item.activo)
    .map((item) => ({ id: item.id, nombres: item.nombres, apellidos: item.apellidos }));

  return (
    <div className="space-y-4 sm:space-y-5">
      <Link
        href={`/pacientes/${paciente.id}`}
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a la ficha del paciente
      </Link>

      <PageHeader
        eyebrow="Historial clínico optométrico"
        title={`${paciente.nombres} ${paciente.apellidos}`}
        description="Filiación, motivo de consulta, antecedentes, examen optométrico, diagnóstico y prescripción. Cada control queda asociado a la ficha del paciente."
        actions={
          <>
            <Badge variant={paciente.activo ? "success" : "secondary"} className="h-7 px-3">
              {paciente.activo ? "Paciente activo" : "Archivado"}
            </Badge>
            <Button asChild variant="outline">
              <Link href={`/pacientes/${paciente.id}`}>
                <FileHeart className="h-4 w-4" />
                Ver ficha completa
              </Link>
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-slate-200/80 bg-white px-5 py-3.5 shadow-card">
        <div className="flex items-center gap-3">
          <Avatar
            initials={initials(paciente.nombres, paciente.apellidos)}
            className="h-10 w-10 text-[12px]"
          />
          <div>
            <p className="text-[12.5px] font-semibold text-ink">
              {paciente.nombres} {paciente.apellidos}
            </p>
            <p className="text-[10.5px] text-ink-subtle">Ficha clínica · ÓPTICA MD</p>
          </div>
        </div>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-muted">
          <span className="flex items-center gap-1.5">
            <IdCard className="h-3.5 w-3.5 text-primary/70" />
            {paciente.cedula ? `CI ${paciente.cedula}` : "Sin cédula"}
          </span>
          {paciente.edad && (
            <span className="flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5 text-primary/70" />
              {paciente.edad} años
            </span>
          )}
          {paciente.genero && (
            <span className="flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5 text-primary/70" />
              {paciente.genero}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-primary/70" />
            {paciente.telefono}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary/70" />
            Registrado {formatDate(paciente.createdAt)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-ink-subtle">
            Controles
          </span>
          {historias.map((item) => {
            const activa = historia?.id === item.id;
            return (
              <Link
                key={item.id}
                href={`/pacientes/${paciente.id}/historial?hc=${item.id}`}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono text-[10.5px] font-semibold transition-colors",
                  activa
                    ? "border-primary/30 bg-primary-50 text-primary"
                    : "border-slate-200 bg-white text-ink-muted hover:border-primary-200 hover:text-primary",
                )}
              >
                {item.numeroHistoria}
                <span className="font-sans font-normal text-ink-subtle">
                  {formatDate(item.fecha)}
                </span>
              </Link>
            );
          })}
          <Link
            href={`/pacientes/${paciente.id}/historial?nueva=1`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-2.5 py-1.5 text-[10.5px] font-semibold text-ink-muted transition-colors hover:border-accent/50 hover:text-accent-700"
          >
            <Plus className="h-3 w-3" />
            Nuevo control
          </Link>
        </div>
        {historia && (
          <p className="text-[10.5px] text-ink-subtle">
            Guardada el {formatDate(historia.updatedAt)}
          </p>
        )}
      </div>

      {historia && (
        <div className="flex flex-col gap-3 rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50/70 via-white to-accent-50/40 px-4 py-3.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[9.5px] font-bold uppercase tracking-[0.14em] text-primary">
              Historia clínica guardada
            </p>
            <p className="mt-0.5 text-[12px] text-ink">
              <span className="font-mono font-semibold text-primary">{historia.numeroHistoria}</span>
              <span className="text-ink-subtle"> · Control del {formatDate(historia.fecha)}</span>
              {ventaAsociada && (
                <>
                  <span className="text-ink-subtle"> · Venta </span>
                  <Link
                    href={`/ventas?q=${encodeURIComponent(ventaAsociada.codigo)}`}
                    className="font-mono font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    {ventaAsociada.codigo}
                  </Link>
                </>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link
                href={`/pacientes/${paciente.id}/historial/receta?hc=${historia.id}`}
                target="_blank"
              >
                <Printer className="h-4 w-4" />
                Imprimir Receta / PDF
              </Link>
            </Button>
            <VentaDialog
              pacientes={pacientesActivos}
              defaultPacienteId={paciente.id}
              defaultDescripcion={resumenReceta(historia)}
              defaultCategoria="LUNAS"
              defaultNotas={`Venta generada desde la receta ${historia.numeroHistoria}.`}
              historiaId={historia.id}
              trigger={
                <Button variant="accent">
                  <Receipt className="h-4 w-4" />
                  Crear Venta desde esta Receta
                </Button>
              }
            />
          </div>
        </div>
      )}

      <HistorialWizard
        key={historia?.id ?? "nueva"}
        paciente={paciente}
        historia={historia}
      />
    </div>
  );
}
