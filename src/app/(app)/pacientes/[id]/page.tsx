import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  ChevronRight,
  ClipboardList,
  MessageSquareText,
  Eye,
  FileHeart,
  Glasses,
  HeartPulse,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Receipt,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SummaryStat } from "@/components/ui/summary-stat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableWrap,
} from "@/components/ui/table";
import { BrandMark } from "@/components/brand/logo";
import { PacienteDialog } from "@/components/forms/paciente-dialog";
import { VentaDialog } from "@/components/forms/venta-dialog";
import { PagoDialog } from "@/components/forms/pago-dialog";
import { EntregaControl } from "@/components/forms/entrega-control";
import { getDataset, getPaciente } from "@/lib/data";
import { ventaSaldo } from "@/lib/accounting";
import {
  ESTADO_PAGO_LABEL,
  ESTADO_PAGO_STYLE,
} from "@/lib/constants";
import { formatDate, initials, money } from "@/lib/format";
import type { EstadoPago } from "@/lib/types";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const paciente = await getPaciente(id);
  return {
    title: paciente ? `${paciente.nombres} ${paciente.apellidos}` : "Paciente",
  };
}

const SECCIONES = [
  { icon: ClipboardList, label: "Filiación y control" },
  { icon: MessageSquareText, label: "Motivo de consulta" },
  { icon: HeartPulse, label: "Antecedentes" },
  { icon: Eye, label: "Examen optométrico" },
  { icon: Stethoscope, label: "Diagnóstico" },
  { icon: Glasses, label: "Prescripción" },
];

export default async function PacienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [paciente, dataset] = await Promise.all([getPaciente(id), getDataset()]);
  if (!paciente) notFound();

  const ventas = dataset.ventas.filter((venta) => venta.pacienteId === paciente.id);
  const totalVentas = ventas.reduce((sum, venta) => sum + venta.total, 0);
  const saldo = ventas.reduce((sum, venta) => sum + ventaSaldo(venta), 0);
  const ultimaVisita = ventas[0]?.fecha;
  const pacientesActivos = dataset.pacientes
    .filter((p) => p.activo)
    .map((p) => ({ id: p.id, nombres: p.nombres, apellidos: p.apellidos }));

  const contacto = [
    { icon: Phone, label: "Teléfono / WhatsApp", value: paciente.telefono },
    { icon: Mail, label: "Correo electrónico", value: paciente.email ?? "No registrado" },
    { icon: MapPin, label: "Dirección", value: paciente.direccion ?? "No registrada" },
    { icon: Briefcase, label: "Ocupación", value: paciente.ocupacion ?? "No registrada" },
    {
      icon: CalendarDays,
      label: "Fecha de nacimiento",
      value: paciente.fechaNacimiento ? formatDate(paciente.fechaNacimiento) : "No registrada",
    },
    {
      icon: UserRound,
      label: "Edad",
      value: paciente.edad ? `${paciente.edad} años` : "No registrada",
    },
    ...(paciente.genero
      ? [{ icon: UserRound, label: "Género", value: paciente.genero }]
      : []),
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <Link
        href="/pacientes"
        className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Volver a pacientes
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        <div className="relative h-[88px] bg-gradient-to-r from-secondary via-secondary-800 to-primary-600">
          <div className="absolute inset-0 grid-pattern opacity-50" />
          <div className="absolute -right-4 -top-6 h-32 w-32 rounded-full border border-white/10" />
          <BrandMark
            tone="light"
            className="absolute right-6 top-4 h-16 w-16 opacity-25"
          />
          <div className="absolute left-5 top-4 flex items-center gap-2 sm:left-6">
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.14em] text-white/70 ring-1 ring-inset ring-white/15">
              Ficha clínica
            </span>
            <Badge
              variant={paciente.activo ? "success" : "secondary"}
              className="border-0 ring-0"
            >
              {paciente.activo ? "Activo" : "Archivado"}
            </Badge>
          </div>
        </div>

        <div className="relative px-5 pb-5 sm:px-6">
          <div className="-mt-9 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-end gap-3.5">
              <div className="flex h-[74px] w-[74px] items-center justify-center rounded-2xl border-4 border-white bg-primary-50 font-display text-xl font-bold text-primary shadow-sm ring-1 ring-slate-200/60">
                {initials(paciente.nombres, paciente.apellidos)}
              </div>
              <div className="pb-0.5">
                <h1 className="font-display text-[22px] font-bold leading-tight text-ink">
                  {paciente.nombres} {paciente.apellidos}
                </h1>
                <p className="mt-0.5 text-[11.5px] text-ink-muted">
                  CI / RUC {paciente.cedula}
                  {paciente.edad ? ` · ${paciente.edad} años` : ""}
                  {paciente.ocupacion ? ` · ${paciente.ocupacion}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <PacienteDialog
                paciente={paciente}
                trigger={
                  <Button variant="outline" size="icon" title="Editar paciente">
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
              <VentaDialog
                pacientes={pacientesActivos}
                defaultPacienteId={paciente.id}
                trigger={
                  <Button variant="accent">
                    <Receipt className="h-4 w-4" />
                    Nueva venta
                  </Button>
                }
              />
              <Button asChild>
                <Link href={`/pacientes/${paciente.id}/historial`}>
                  <FileHeart className="h-4 w-4" />
                  Historial clínico
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Facturado histórico"
          value={money(totalVentas)}
          hint={`${ventas.length} ventas registradas`}
          icon={Receipt}
        />
        <SummaryStat
          label="Saldo pendiente"
          value={money(saldo)}
          hint={saldo > 0 ? "Cuentas por cobrar del paciente" : "Sin saldos pendientes"}
          icon={FileHeart}
          tone={saldo > 0 ? "accent" : "green"}
        />
        <SummaryStat
          label="Última visita"
          value={ultimaVisita ? formatDate(ultimaVisita) : "—"}
          hint={ventas.length ? "Última atención registrada" : "Aún sin atenciones"}
          icon={CalendarDays}
          tone="navy"
        />
        <SummaryStat
          label="Paciente desde"
          value={formatDate(paciente.createdAt)}
          hint="Fecha de registro en el sistema"
          icon={UserRound}
          tone="slate"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center justify-between">
              <div>
                <CardTitle>Historial de ventas</CardTitle>
                <p className="mt-1 text-[12px] text-ink-muted">
                  Compras, consultas y saldos del paciente.
                </p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-ink-muted">
                {ventas.length} registros
              </span>
            </CardHeader>
            <CardContent className="p-0 sm:p-0">
              {ventas.length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="Sin ventas registradas"
                  description="Registra la primera venta o consulta de este paciente."
                  action={
                    <VentaDialog
                      pacientes={pacientesActivos}
                      defaultPacienteId={paciente.id}
                    />
                  }
                />
              ) : (
                <TableWrap>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                        <TableHead className="pl-5 sm:pl-6">Comprobante</TableHead>
                        <TableHead>Detalle</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Saldo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="pr-5 text-right sm:pr-6">Entrega</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ventas.map((venta) => {
                        const saldoVenta = ventaSaldo(venta);
                        return (
                          <TableRow key={venta.id} className="table-row-hover">
                            <TableCell className="pl-5 sm:pl-6">
                              <p className="font-mono text-[10px] font-semibold text-primary">
                                {venta.codigo}
                              </p>
                              <p className="mt-0.5 whitespace-nowrap text-[10px] text-ink-subtle">
                                {formatDate(venta.fecha)}
                              </p>
                            </TableCell>
                            <TableCell>
                              <p className="max-w-[220px] truncate text-[12px] text-ink">
                                {venta.descripcion}
                              </p>
                            </TableCell>
                            <TableCell className="text-right text-[12px] font-semibold tabular-nums">
                              {money(venta.total)}
                            </TableCell>
                            <TableCell className="text-right">
                              {saldoVenta > 0 ? (
                                <PagoDialog
                                  ventaId={venta.id}
                                  codigo={venta.codigo}
                                  saldo={saldoVenta}
                                  trigger={
                                    <button className="whitespace-nowrap text-[11.5px] font-semibold tabular-nums text-accent-700 underline-offset-2 hover:underline">
                                      {money(saldoVenta)}
                                    </button>
                                  }
                                />
                              ) : (
                                <span className="text-[11px] text-emerald-600">Pagada</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(ESTADO_PAGO_STYLE[venta.estadoPago as EstadoPago])}
                              >
                                {ESTADO_PAGO_LABEL[venta.estadoPago as EstadoPago]}
                              </Badge>
                            </TableCell>
                            <TableCell className="pr-5 text-right sm:pr-6">
                              <EntregaControl ventaId={venta.id} estado={venta.estadoEntrega} />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableWrap>
              )}
            </CardContent>
          </Card>

          {paciente.notas && (
            <Card>
              <CardHeader>
                <CardTitle>Notas clínicas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[12.5px] leading-relaxed text-ink-muted">{paciente.notas}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Datos de contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5">
              {contacto.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-ink-muted">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-subtle">
                        {item.label}
                      </p>
                      <p className="break-words text-[12px] text-ink">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-primary-100">
            <div className="bg-gradient-to-br from-secondary to-secondary-900 px-5 py-4 text-white">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white/50">
                <FileHeart className="h-3.5 w-3.5 text-accent-300" />
                Historial optométrico
              </p>
              <p className="mt-1 font-display text-[15px] font-semibold">
                6 secciones clínicas
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-white/50">
                Filiación, motivo, antecedentes, examen, diagnóstico y prescripción.
              </p>
            </div>
            <CardContent className="space-y-1.5 pt-4">
              {SECCIONES.map((seccion, index) => {
                const Icon = seccion.icon;
                return (
                  <div
                    key={seccion.label}
                    className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-50 text-[10px] font-bold text-primary">
                      {index + 1}
                    </span>
                    <Icon className="h-3.5 w-3.5 text-ink-subtle" />
                    <span className="truncate text-[11.5px] text-ink-muted">{seccion.label}</span>
                    <ChevronRight className="ml-auto h-3 w-3 text-slate-300" />
                  </div>
                );
              })}
              <Button asChild variant="subtle" className="mt-2 w-full">
                <Link href={`/pacientes/${paciente.id}/historial`}>
                  Abrir historial
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
