"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  demoCrearCompra,
  demoCrearGasto,
  demoCrearVenta,
  demoRegistrarPago,
  demoVincularVentaHistoria,
} from "@/lib/demo-store";
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
  if (!prisma) {
    const { getStore } = await import("@/lib/demo-store");
    return `V-${year}-${String(getStore().ventaSeq + 1).padStart(4, "0")}`;
  }
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
    if (!prisma) {
      const venta = demoCrearVenta({
        fecha,
        categoria,
        descripcion,
        total,
        metodoPago,
        estadoEntrega,
        pacienteId,
        clienteNombre,
        anticipo,
        notas,
      });
      if (historiaId) demoVincularVentaHistoria(historiaId, venta.id);
    } else {
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
    }

    refresh();
    if (historiaId && pacienteId) revalidatePath(`/pacientes/${pacienteId}/historial`);
    return { ok: true, message: "Venta registrada correctamente" };
  } catch (error) {
    console.error("[crearVenta]", error);
    return { ok: false, message: "No se pudo registrar la venta. Intenta nuevamente." };
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
    if (!prisma) {
      const venta = demoRegistrarPago({
        ventaId,
        monto,
        metodo: metodoRaw as MetodoPago,
        fecha,
        nota,
      });
      if (!venta) return { ok: false, message: "La venta ya no existe" };
    } else {
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
    }

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
    if (!prisma) {
      const { getStore } = await import("@/lib/demo-store");
      const venta = getStore().ventas.find((v) => v.id === ventaId);
      if (!venta) return { ok: false, message: "Venta no encontrada" };
      venta.estadoEntrega = estado;
    } else {
      await prisma.venta.update({
        where: { id: ventaId },
        data: { estadoEntrega: estado },
      });
    }
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
    if (!prisma) {
      demoCrearCompra({
        fecha,
        proveedor,
        proveedorRuc,
        numeroComprobante,
        categoria: categoriaRaw as CategoriaCompra,
        descripcion,
        total,
      });
    } else {
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
    }
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
    if (!prisma) {
      demoCrearGasto({
        fecha,
        categoria: categoriaRaw as CategoriaGasto,
        descripcion,
        monto,
        recurrente,
        comprobante,
      });
    } else {
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
    }
    refresh();
    return { ok: true, message: "Gasto registrado correctamente" };
  } catch (error) {
    console.error("[crearGasto]", error);
    return { ok: false, message: "No se pudo registrar el gasto" };
  }
}
