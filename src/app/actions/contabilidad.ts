"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getString, getNumber, getOptional, getBoolean, parseDateInput } from "@/lib/form";
import type {
  ActionState,
  CategoriaCompra,
  CategoriaGasto,
  CategoriaVenta,
  EstadoEntrega,
  MetodoPago,
} from "@/lib/types";

const CATEGORIAS_VENTA = ["LUNAS", "ARMAZONES", "LENTES_CONTACTO", "ACCESORIOS", "CONSULTA"];
const CATEGORIAS_COMPRA = [
  "ARMAZONES",
  "LUNAS_LABORATORIO",
  "LENTES_CONTACTO",
  "INSUMOS",
  "EQUIPOS",
  "OTROS",
];
const CATEGORIAS_GASTO = [
  "ARRIENDO",
  "SERVICIOS",
  "SUELDOS",
  "MANTENIMIENTO",
  "PUBLICIDAD",
  "OTROS",
];
const METODOS = ["EFECTIVO", "TRANSFERENCIA", "TARJETA"];
const ENTREGAS = ["EN_TALLER", "LISTO", "ENTREGADO"];

function refresh() {
  revalidatePath("/dashboard");
  revalidatePath("/ventas");
  revalidatePath("/compras");
  revalidatePath("/gastos");
  revalidatePath("/reportes");
  revalidatePath("/pacientes");
}

async function siguienteSecuenciaVenta(fecha: Date): Promise<string> {
  const year = fecha.getFullYear();
  const count = await prisma.venta.count({
    where: {
      fecha: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });
  return `V-${year}-${String(count + 1).padStart(4, "0")}`;
}

// ─────────────────────────────────────────────────────────────
//  VENTAS
// ─────────────────────────────────────────────────────────────

export async function crearVenta(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fecha = parseDateInput(getString(formData, "fecha"));
  const categoriaRaw = getString(formData, "categoria");
  const descripcion = getString(formData, "descripcion");
  const total = getNumber(formData, "total");
  const metodoPagoRaw = getString(formData, "metodoPago");
  const estadoEntregaRaw = getString(formData, "estadoEntrega") || "ENTREGADO";
  const anticipo = getNumber(formData, "anticipo");
  const pacienteId = getOptional(formData, "pacienteId");
  const clienteNombre = getOptional(formData, "clienteNombre");
  const notas = getOptional(formData, "notas");
  const historiaId = getOptional(formData, "historiaId");

  const errors: Record<string, string> = {};
  if (!CATEGORIAS_VENTA.includes(categoriaRaw)) errors.categoria = "Selecciona una categoría";
  if (!descripcion) errors.descripcion = "Describe el producto o servicio";
  if (total <= 0) errors.total = "El total debe ser mayor a cero";
  if (!METODOS.includes(metodoPagoRaw)) errors.metodoPago = "Selecciona un método de pago";
  if (!ENTREGAS.includes(estadoEntregaRaw)) errors.estadoEntrega = "Estado no válido";
  if (anticipo < 0 || anticipo > total) errors.anticipo = "El abono no puede superar el total";
  if (!pacienteId && !clienteNombre && !descripcion) {
    errors.clienteNombre = "Indica el paciente o un nombre de referencia";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados", errors };
  }

  const categoria = categoriaRaw as CategoriaVenta;
  const metodoPago = metodoPagoRaw as MetodoPago;
  const estadoEntrega = estadoEntregaRaw as EstadoEntrega;
  const estadoPago = anticipo <= 0 ? "PENDIENTE" : anticipo >= total ? "PAGADA" : "PARCIAL";

  try {
    const secuencia = await siguienteSecuenciaVenta(fecha);
    const base = Number(secuencia.split("-").at(-1));
    const year = fecha.getFullYear();
    let ventaCreadaId: string | null = null;
    for (let intento = 0; intento < 5; intento++) {
      const codigo = `V-${year}-${String(base + intento).padStart(4, "0")}`;
      try {
        const creada = await prisma.venta.create({
          data: {
            codigo,
            fecha,
            categoria,
            descripcion,
            total,
            metodoPago,
            estadoPago,
            estadoEntrega,
            pacienteId,
            clienteNombre,
            notas,
            pagos:
              anticipo > 0
                ? {
                    create: {
                      monto: anticipo,
                      metodo: metodoPago,
                      fecha,
                      nota: anticipo < total ? "Abono inicial / anticipo" : "Pago total",
                    },
                  }
                : undefined,
          },
        });
        ventaCreadaId = creada.id;
        break;
      } catch (error) {
        const esDuplicado =
          error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
        if (!esDuplicado || intento === 4) throw error;
      }
    }
    if (historiaId && ventaCreadaId) {
      try {
        await prisma.historiaClinica.update({
          where: { id: historiaId },
          data: { ventaId: ventaCreadaId },
        });
      } catch (error) {
        console.error("[crearVenta] No se pudo vincular la historia clínica", error);
      }
    }

    refresh();
    if (historiaId && pacienteId) revalidatePath(`/pacientes/${pacienteId}/historial`);
    return { ok: true, message: "Venta registrada correctamente" };
  } catch (error) {
    console.error("[crearVenta]", error);
    return { ok: false, message: "No se pudo registrar la venta. Intenta nuevamente." };
  }
}

export async function actualizarVenta(
  ventaId: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!ventaId) return { ok: false, message: "Venta no identificada" };

  const fecha = parseDateInput(getString(formData, "fecha"));
  const categoriaRaw = getString(formData, "categoria");
  const descripcion = getString(formData, "descripcion");
  const total = getNumber(formData, "total");
  const metodoPagoRaw = getString(formData, "metodoPago");
  const estadoEntregaRaw = getString(formData, "estadoEntrega") || "ENTREGADO";
  const pacienteId = getOptional(formData, "pacienteId");
  const clienteNombre = getOptional(formData, "clienteNombre");
  const notas = getOptional(formData, "notas");

  const errors: Record<string, string> = {};
  if (!CATEGORIAS_VENTA.includes(categoriaRaw)) errors.categoria = "Selecciona una categoría";
  if (!descripcion) errors.descripcion = "Describe el producto o servicio";
  if (total <= 0) errors.total = "El total debe ser mayor a cero";
  if (!METODOS.includes(metodoPagoRaw)) errors.metodoPago = "Selecciona un método de pago";
  if (!ENTREGAS.includes(estadoEntregaRaw)) errors.estadoEntrega = "Estado no válido";
  if (!pacienteId && !clienteNombre) {
    errors.clienteNombre = "Indica el paciente o un nombre de referencia";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados", errors };
  }

  try {
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: { pagos: true },
    });
    if (!venta) return { ok: false, message: "La venta ya no existe" };

    const pagado = venta.pagos.reduce((suma, pago) => suma + Number(pago.monto), 0);
    if (total + 0.01 < pagado) {
      return {
        ok: false,
        message: `El total no puede ser menor a lo ya abonado ($${pagado.toFixed(2)})`,
        errors: { total: "El total es menor que los pagos registrados" },
      };
    }

    const estadoPago =
      total <= pagado + 0.01 ? "PAGADA" : pagado > 0 ? "PARCIAL" : "PENDIENTE";

    await prisma.venta.update({
      where: { id: ventaId },
      data: {
        fecha,
        categoria: categoriaRaw as CategoriaVenta,
        descripcion,
        total,
        metodoPago: metodoPagoRaw as MetodoPago,
        estadoPago,
        estadoEntrega: estadoEntregaRaw as EstadoEntrega,
        pacienteId,
        clienteNombre,
        notas,
      },
    });

    refresh();
    return { ok: true, message: "Venta actualizada correctamente" };
  } catch (error) {
    console.error("[actualizarVenta]", error);
    return { ok: false, message: "No se pudo actualizar la venta. Intenta nuevamente." };
  }
}

export async function eliminarVenta(ventaId: string): Promise<ActionState> {
  if (!ventaId) return { ok: false, message: "Venta no identificada" };

  try {
    await prisma.venta.delete({ where: { id: ventaId } });
    refresh();
    return { ok: true, message: "Venta eliminada correctamente" };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, message: "La venta ya no existe" };
    }
    console.error("[eliminarVenta]", error);
    return { ok: false, message: "No se pudo eliminar la venta" };
  }
}

export async function registrarPago(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const ventaId = getString(formData, "ventaId");
  const monto = getNumber(formData, "monto");
  const metodoRaw = getString(formData, "metodo") || "EFECTIVO";
  const fecha = parseDateInput(getString(formData, "fecha"));
  const nota = getOptional(formData, "nota");

  if (!ventaId) return { ok: false, message: "Venta no identificada" };
  if (monto <= 0) {
    return { ok: false, message: "Revisa los campos", errors: { monto: "Ingresa un monto válido" } };
  }
  if (!METODOS.includes(metodoRaw)) {
    return { ok: false, message: "Método de pago no válido" };
  }

  try {
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: { pagos: true },
    });
    if (!venta) return { ok: false, message: "La venta ya no existe" };
    const pagado = venta.pagos.reduce((s, p) => s + Number(p.monto), 0);
    const saldo = Number(venta.total) - pagado;
    if (monto > saldo + 0.01) {
      return { ok: false, message: `El saldo pendiente es de $${saldo.toFixed(2)}` };
    }
    const nuevoPagado = pagado + monto;
    await prisma.$transaction([
      prisma.pagoVenta.create({
        data: { ventaId, monto, metodo: metodoRaw as MetodoPago, fecha, nota },
      }),
      prisma.venta.update({
        where: { id: ventaId },
        data: {
          estadoPago: nuevoPagado >= Number(venta.total) - 0.01 ? "PAGADA" : "PARCIAL",
        },
      }),
    ]);

    refresh();
    return { ok: true, message: "Abono registrado correctamente" };
  } catch (error) {
    console.error("[registrarPago]", error);
    return { ok: false, message: "No se pudo registrar el abono" };
  }
}

export async function actualizarEntrega(
  ventaId: string,
  estado: EstadoEntrega,
): Promise<ActionState> {
  if (!ENTREGAS.includes(estado)) return { ok: false, message: "Estado no válido" };
  try {
    await prisma.venta.update({
      where: { id: ventaId },
      data: { estadoEntrega: estado },
    });
    refresh();
    return { ok: true, message: "Estado de entrega actualizado" };
  } catch (error) {
    console.error("[actualizarEntrega]", error);
    return { ok: false, message: "No se pudo actualizar la entrega" };
  }
}

// ─────────────────────────────────────────────────────────────
//  COMPRAS
// ─────────────────────────────────────────────────────────────

export async function crearCompra(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fecha = parseDateInput(getString(formData, "fecha"));
  const proveedor = getString(formData, "proveedor");
  const proveedorRuc = getOptional(formData, "proveedorRuc");
  const numeroComprobante = getOptional(formData, "numeroComprobante");
  const categoriaRaw = getString(formData, "categoria");
  const descripcion = getString(formData, "descripcion");
  const total = getNumber(formData, "total");

  const errors: Record<string, string> = {};
  if (!proveedor) errors.proveedor = "Ingresa el proveedor";
  if (!CATEGORIAS_COMPRA.includes(categoriaRaw)) errors.categoria = "Selecciona una categoría";
  if (!descripcion) errors.descripcion = "Describe la compra";
  if (total <= 0) errors.total = "El valor debe ser mayor a cero";
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados", errors };
  }

  try {
    await prisma.compra.create({
      data: {
        fecha,
        proveedor,
        proveedorRuc,
        numeroComprobante,
        categoria: categoriaRaw as CategoriaCompra,
        descripcion,
        total,
      },
    });
    refresh();
    return { ok: true, message: "Compra registrada correctamente" };
  } catch (error) {
    console.error("[crearCompra]", error);
    return { ok: false, message: "No se pudo registrar la compra" };
  }
}

// ─────────────────────────────────────────────────────────────
//  GASTOS
// ─────────────────────────────────────────────────────────────

export async function crearGasto(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const fecha = parseDateInput(getString(formData, "fecha"));
  const categoriaRaw = getString(formData, "categoria");
  const descripcion = getString(formData, "descripcion");
  const monto = getNumber(formData, "monto");
  const recurrente = getBoolean(formData, "recurrente");
  const comprobante = getOptional(formData, "comprobante");

  const errors: Record<string, string> = {};
  if (!CATEGORIAS_GASTO.includes(categoriaRaw)) errors.categoria = "Selecciona una categoría";
  if (!descripcion) errors.descripcion = "Describe el gasto";
  if (monto <= 0) errors.monto = "El valor debe ser mayor a cero";
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados", errors };
  }

  try {
    await prisma.gasto.create({
      data: {
        fecha,
        categoria: categoriaRaw as CategoriaGasto,
        descripcion,
        monto,
        recurrente,
        comprobante,
      },
    });
    refresh();
    return { ok: true, message: "Gasto registrado correctamente" };
  } catch (error) {
    console.error("[crearGasto]", error);
    return { ok: false, message: "No se pudo registrar el gasto" };
  }
}
