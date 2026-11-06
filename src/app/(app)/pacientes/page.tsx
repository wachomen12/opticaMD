import type { Metadata } from "next";
import Link from "next/link";
import {
  CalendarPlus,
  FileHeart,
  Pencil,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { SummaryStat } from "@/components/ui/summary-stat";
import { Avatar } from "@/components/ui/avatar";
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
import { PacienteDialog } from "@/components/forms/paciente-dialog";
import { EliminarPacienteButton } from "@/components/forms/eliminar-paciente";
import { getDataset } from "@/lib/data";
import { ventaSaldo } from "@/lib/accounting";
import { formatDate, initials, isInMonth, money, parseMonthParam } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Pacientes" };

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim().toLowerCase();
  const estado = params.estado ?? "activos";
  const now = new Date();
  const { mes, anio } = parseMonthParam(undefined);

  const dataset = await getDataset();
  const ventasPorPaciente = new Map<string, { count: number; total: number; saldo: number; ultima?: string }>();
  for (const venta of dataset.ventas) {
    if (!venta.pacienteId) continue;
    const actual = ventasPorPaciente.get(venta.pacienteId) ?? { count: 0, total: 0, saldo: 0 };
    actual.count += 1;
    actual.total += venta.total;
    actual.saldo += ventaSaldo(venta);
    if (!actual.ultima || +new Date(venta.fecha) > +new Date(actual.ultima)) {
      actual.ultima = venta.fecha;
    }
    ventasPorPaciente.set(venta.pacienteId, actual);
  }

  const pacientesBase = dataset.pacientes.filter((paciente) => {
    if (estado === "todos") return true;
    if (estado === "archivados") return !paciente.activo;
    return paciente.activo;
  });

  const pacientes = pacientesBase.filter((paciente) => {
    if (!q) return true;
    return (
      `${paciente.nombres} ${paciente.apellidos}`.toLowerCase().includes(q) ||
      (paciente.cedula ?? "").toLowerCase().includes(q) ||
      paciente.telefono.toLowerCase().includes(q) ||
      (paciente.email ?? "").toLowerCase().includes(q)
    );
  });

  const activos = dataset.pacientes.filter((paciente) => paciente.activo);
  const nuevosMes = dataset.pacientes.filter((paciente) =>
    isInMonth(paciente.createdAt, mes, anio),
  ).length;
  const pacientesConVenta = new Set(
    dataset.ventas
      .filter((venta) => isInMonth(venta.fecha, mes, anio) && venta.pacienteId)
      .map((venta) => venta.pacienteId),
  ).size;
  const saldoTotal = dataset.ventas.reduce((sum, venta) => sum + ventaSaldo(venta), 0);

  const tabs = [
    { value: "activos", label: "Activos", count: activos.length },
    { value: "archivados", label: "Archivados", count: dataset.pacientes.length - activos.length },
    { value: "todos", label: "Todos", count: dataset.pacientes.length },
  ];

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader
        eyebrow="Clínica optométrica"
        title="Pacientes e historial clínico"
        description="Fichas de pacientes con datos de contacto y acceso al historial optométrico de 6 secciones."
        actions={<PacienteDialog />}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryStat
          label="Pacientes activos"
          value={`${activos.length}`}
          hint={`${dataset.pacientes.length} fichas registradas`}
          icon={Users}
        />
        <SummaryStat
          label="Nuevos este mes"
          value={`${nuevosMes}`}
          hint={`${now.toLocaleDateString("es-EC", { month: "long", year: "numeric" })}`}
          icon={CalendarPlus}
          tone="green"
        />
        <SummaryStat
          label="Atendidos este mes"
          value={`${pacientesConVenta}`}
          hint="Pacientes con ventas o consultas"
          icon={UserRound}
          tone="navy"
        />
        <SummaryStat
          label="Saldo por cobrar"
          value={money(saldoTotal)}
          hint="Asociado a ventas de pacientes"
          icon={FileHeart}
          tone="accent"
        />
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <form action="/pacientes" method="get" className="relative flex w-full max-w-md items-center">
            <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Buscar por nombre, cédula, teléfono o correo…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-20 text-[12.5px] text-ink shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
            />
            {estado !== "activos" && <input type="hidden" name="estado" value={estado} />}
            <button
              type="submit"
              className="absolute right-1.5 h-7 rounded-lg bg-primary px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Buscar
            </button>
          </form>

          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={`/pacientes?estado=${tab.value}${params.q ? `&q=${encodeURIComponent(params.q)}` : ""}`}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11.5px] font-semibold transition-all",
                  estado === tab.value
                    ? "bg-white text-ink shadow-sm"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[9px] tabular-nums",
                    estado === tab.value
                      ? "bg-primary-50 text-primary"
                      : "bg-slate-200/70 text-ink-subtle",
                  )}
                >
                  {tab.count}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
        {pacientes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No se encontraron pacientes"
            description="Prueba con otro término de búsqueda o registra un nuevo paciente."
            action={<PacienteDialog />}
          />
        ) : (
          <>
            <TableWrap>
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-slate-50/60 hover:bg-slate-50/60">
                    <TableHead className="pl-5 sm:pl-6">Paciente</TableHead>
                    <TableHead>Contacto</TableHead>
                    <TableHead>Última visita</TableHead>
                    <TableHead className="text-right">Compras</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="pr-5 text-right sm:pr-6">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientes.map((paciente) => {
                    const resumen = ventasPorPaciente.get(paciente.id);
                    return (
                      <TableRow key={paciente.id} className="table-row-hover">
                        <TableCell className="pl-5 sm:pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar
                              initials={initials(paciente.nombres, paciente.apellidos)}
                              tone={paciente.activo ? "primary" : "soft"}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  href={`/pacientes/${paciente.id}`}
                                  className="block max-w-[210px] truncate text-[12.5px] font-semibold text-ink transition-colors hover:text-primary"
                                >
                                  {paciente.nombres} {paciente.apellidos}
                                </Link>
                                {!paciente.activo && (
                                  <Badge variant="secondary" className="px-1.5 py-0.5 text-[8px]">
                                    Archivado
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[10px] text-ink-subtle">
                                {paciente.cedula ? `CI ${paciente.cedula}` : "Sin cédula"}
                                {paciente.edad ? ` · ${paciente.edad} años` : ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-[11.5px] text-ink">{paciente.telefono}</p>
                          <p className="max-w-[180px] truncate text-[10px] text-ink-subtle">
                            {paciente.email ?? paciente.ocupacion ?? "Sin correo"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className="whitespace-nowrap text-[11.5px] text-ink-muted">
                            {resumen?.ultima ? formatDate(resumen.ultima) : "Sin visitas"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="text-[12px] font-semibold tabular-nums text-ink">
                            {resumen ? money(resumen.total) : "—"}
                          </p>
                          <p className="text-[9.5px] text-ink-subtle">
                            {resumen?.count ?? 0} ventas
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "text-[11.5px] font-semibold tabular-nums",
                              (resumen?.saldo ?? 0) > 0 ? "text-accent-700" : "text-ink-subtle",
                            )}
                          >
                            {resumen ? money(resumen.saldo) : "—"}
                          </span>
                        </TableCell>
                        <TableCell className="pr-5 text-right sm:pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild size="sm" variant="subtle">
                              <Link href={`/pacientes/${paciente.id}/historial`}>
                                <FileHeart className="h-3.5 w-3.5" />
                                Historial
                              </Link>
                            </Button>
                            <PacienteDialog
                              paciente={paciente}
                              trigger={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  title="Editar paciente"
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              }
                            />
                            <EliminarPacienteButton
                              id={paciente.id}
                              nombre={`${paciente.nombres} ${paciente.apellidos}`}
                              activo={paciente.activo}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableWrap>
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5 text-[11px] text-ink-muted sm:px-6">
              <p>
                Mostrando <span className="font-semibold text-ink">{pacientes.length}</span> pacientes
              </p>
              <p className="hidden sm:block">Haz clic en el nombre para abrir la ficha completa.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
