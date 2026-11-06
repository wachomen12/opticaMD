import {
  CategoriaCompra as PrismaCategoriaCompra,
  CategoriaGasto as PrismaCategoriaGasto,
  CategoriaVenta as PrismaCategoriaVenta,
  EstadoEntrega as PrismaEstadoEntrega,
  EstadoPago as PrismaEstadoPago,
  MetodoPago as PrismaMetodoPago,
  type Compra as PrismaCompra,
  type Gasto as PrismaGasto,
  type HistoriaClinica as PrismaHistoriaClinica,
  type Paciente as PrismaPaciente,
  type PagoVenta as PrismaPagoVenta,
  type Venta as PrismaVenta,
} from "@prisma/client";
import { prisma } from "./prisma";
import type {
  CategoriaCompra,
  CategoriaGasto,
  CategoriaVenta,
  Compra,
  Dataset,
  EstadoEntrega,
  EstadoPago,
  Gasto,
  HistoriaClinica,
  MetodoPago,
  Paciente,
  PagoVenta,
  Venta,
} from "./types";

// ─────────────────────────────────────────────────────────────
//  Capa de acceso a datos — PostgreSQL vía Prisma.
// ─────────────────────────────────────────────────────────────

const n = (value: unknown) => Number(value ?? 0);

function mapPaciente(p: PrismaPaciente): Paciente {
  return {
    id: p.id,
    cedula: p.cedula,
    nombres: p.nombres,
    apellidos: p.apellidos,
    fechaNacimiento: p.fechaNacimiento ? p.fechaNacimiento.toISOString() : null,
    edad: p.edad,
    genero: p.genero,
    telefono: p.telefono,
    email: p.email,
    direccion: p.direccion,
    ocupacion: p.ocupacion,
    notas: p.notas,
    activo: p.activo,
    createdAt: p.createdAt.toISOString(),
  };
}

function mapPago(p: PrismaPagoVenta): PagoVenta {
  return {
    id: p.id,
    ventaId: p.ventaId,
    monto: n(p.monto),
    metodo: p.metodo as MetodoPago,
    fecha: p.fecha.toISOString(),
    nota: p.nota,
  };
}

function mapVenta(v: PrismaVenta & { pagos?: PrismaPagoVenta[] }): Venta {
  return {
    id: v.id,
    codigo: v.codigo,
    fecha: v.fecha.toISOString(),
    categoria: v.categoria as CategoriaVenta,
    descripcion: v.descripcion,
    total: n(v.total),
    metodoPago: v.metodoPago as MetodoPago,
    estadoPago: v.estadoPago as EstadoPago,
    estadoEntrega: v.estadoEntrega as EstadoEntrega,
    pacienteId: v.pacienteId,
    clienteNombre: v.clienteNombre,
    notas: v.notas,
    pagos: (v.pagos ?? []).map(mapPago),
  };
}

function mapCompra(c: PrismaCompra): Compra {
  return {
    id: c.id,
    fecha: c.fecha.toISOString(),
    proveedor: c.proveedor,
    proveedorRuc: c.proveedorRuc,
    numeroComprobante: c.numeroComprobante,
    categoria: c.categoria as CategoriaCompra,
    descripcion: c.descripcion,
    total: n(c.total),
  };
}

function mapGasto(g: PrismaGasto): Gasto {
  return {
    id: g.id,
    fecha: g.fecha.toISOString(),
    categoria: g.categoria as CategoriaGasto,
    descripcion: g.descripcion,
    monto: n(g.monto),
    recurrente: g.recurrente,
    comprobante: g.comprobante,
  };
}

function mapHistoria(h: PrismaHistoriaClinica): HistoriaClinica {
  return {
    id: h.id,
    numeroHistoria: h.numeroHistoria,
    fecha: h.fecha.toISOString(),
    usaLentes: h.usaLentes,
    ultimoControlVisual: h.ultimoControlVisual,
    ultimoCambioLentes: h.ultimoCambioLentes,
    motivosConsulta: h.motivosConsulta,
    motivoConsultaOtros: h.motivoConsultaOtros,
    antecedentesPatologicos: h.antecedentesPatologicos,
    antecedentesPatologicosOtros: h.antecedentesPatologicosOtros,
    antecedentesOftalmologicos: h.antecedentesOftalmologicos,
    antecedentesOftalmologicosOtros: h.antecedentesOftalmologicosOtros,
    antecedentesFamiliares: h.antecedentesFamiliares,
    antecedentesFamiliaresOtros: h.antecedentesFamiliaresOtros,
    avSinCorreccionVL_OD: h.avSinCorreccionVL_OD,
    avSinCorreccionVL_OI: h.avSinCorreccionVL_OI,
    avSinCorreccionVP_OD: h.avSinCorreccionVP_OD,
    avSinCorreccionVP_OI: h.avSinCorreccionVP_OI,
    avConCorreccionVL_OD: h.avConCorreccionVL_OD,
    avConCorreccionVL_OI: h.avConCorreccionVL_OI,
    avConCorreccionVP_OD: h.avConCorreccionVP_OD,
    avConCorreccionVP_OI: h.avConCorreccionVP_OI,
    papilaOptica: h.papilaOptica,
    macula: h.macula,
    retina: h.retina,
    observacionesSegmentoPosterior: h.observacionesSegmentoPosterior,
    diagnosticos: h.diagnosticos,
    diagnosticoOtro: h.diagnosticoOtro,
    esfera_OD: h.esfera_OD,
    esfera_OI: h.esfera_OI,
    cilindro_OD: h.cilindro_OD,
    cilindro_OI: h.cilindro_OI,
    eje_OD: h.eje_OD,
    eje_OI: h.eje_OI,
    adicion_OD: h.adicion_OD,
    adicion_OI: h.adicion_OI,
    altura_OD: h.altura_OD,
    altura_OI: h.altura_OI,
    dnp_OD: h.dnp_OD,
    dnp_OI: h.dnp_OI,
    avFinal_OD: h.avFinal_OD,
    avFinal_OI: h.avFinal_OI,
    tipoLenteRecomendado: h.tipoLenteRecomendado,
    tipoLenteOtro: h.tipoLenteOtro,
    tratamientosRecomendados: h.tratamientosRecomendados,
    tratamientoOtro: h.tratamientoOtro,
    pacienteId: h.pacienteId,
    ventaId: h.ventaId,
    createdAt: h.createdAt.toISOString(),
    updatedAt: h.updatedAt.toISOString(),
  };
}

export async function getDataset(): Promise<Dataset> {
  const [pacientes, ventas, compras, gastos] = await Promise.all([
    prisma.paciente.findMany({ orderBy: [{ apellidos: "asc" }, { nombres: "asc" }] }),
    prisma.venta.findMany({ include: { pagos: true }, orderBy: { fecha: "desc" } }),
    prisma.compra.findMany({ orderBy: { fecha: "desc" } }),
    prisma.gasto.findMany({ orderBy: { fecha: "desc" } }),
  ]);

  return {
    pacientes: pacientes.map(mapPaciente),
    ventas: ventas.map(mapVenta),
    compras: compras.map(mapCompra),
    gastos: gastos.map(mapGasto),
  };
}

export async function getPaciente(id: string): Promise<Paciente | null> {
  const paciente = await prisma.paciente.findUnique({ where: { id } });
  return paciente ? mapPaciente(paciente) : null;
}

export async function getVenta(id: string): Promise<Venta | null> {
  const venta = await prisma.venta.findUnique({
    where: { id },
    include: { pagos: true },
  });
  return venta ? mapVenta(venta) : null;
}

/** Historia clínica vinculada a una venta (si existe). */
export async function getHistoriaPorVenta(
  ventaId: string,
): Promise<HistoriaClinica | null> {
  const historia = await prisma.historiaClinica.findUnique({
    where: { ventaId },
  });
  return historia ? mapHistoria(historia) : null;
}

/** Todas las historias vinculadas a una venta, indexables por ventaId. */
export async function getHistoriasVinculadas(): Promise<HistoriaClinica[]> {
  const historias = await prisma.historiaClinica.findMany({
    where: { ventaId: { not: null } },
  });
  return historias.map(mapHistoria);
}

/** Historias clínicas de un paciente, de la más reciente a la más antigua. */
export async function getHistoriasPaciente(pacienteId: string): Promise<HistoriaClinica[]> {
  const historias = await prisma.historiaClinica.findMany({
    where: { pacienteId },
    orderBy: { fecha: "desc" },
  });
  return historias.map(mapHistoria);
}

export async function getHistoria(id: string): Promise<HistoriaClinica | null> {
  const historia = await prisma.historiaClinica.findUnique({ where: { id } });
  return historia ? mapHistoria(historia) : null;
}

/** Nombres visibles de pacientes para selects y tablas. */
export function nombrePaciente(
  paciente: Paciente | undefined,
  fallback?: string | null,
): string {
  if (paciente) return `${paciente.nombres} ${paciente.apellidos}`;
  return fallback?.trim() || "Cliente ocasional";
}

export const prismaEnums = {
  CategoriaVenta: PrismaCategoriaVenta,
  CategoriaCompra: PrismaCategoriaCompra,
  CategoriaGasto: PrismaCategoriaGasto,
  MetodoPago: PrismaMetodoPago,
  EstadoPago: PrismaEstadoPago,
  EstadoEntrega: PrismaEstadoEntrega,
};
