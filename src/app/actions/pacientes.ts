"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  demoActualizarPaciente,
  demoCrearPaciente,
  demoEliminarPaciente,
  getStore,
} from "@/lib/demo-store";
import { prisma } from "@/lib/prisma";
import { getNumber, getOptional, getString, parseDateInput } from "@/lib/form";
import type { ActionState, Paciente } from "@/lib/types";

function calcularEdad(fechaNacimiento: Date | null, edadManual: number): number | null {
  if (fechaNacimiento) {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const m = hoy.getMonth() - fechaNacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) edad--;
    return edad >= 0 && edad < 130 ? edad : null;
  }
  return edadManual > 0 && edadManual < 130 ? edadManual : null;
}

function leerPaciente(formData: FormData) {
  const fechaRaw = getString(formData, "fechaNacimiento");
  const fechaNacimiento = fechaRaw ? parseDateInput(fechaRaw) : null;
  const edadManual = getNumber(formData, "edad");
  return {
    cedula: getString(formData, "cedula"),
    nombres: getString(formData, "nombres"),
    apellidos: getString(formData, "apellidos"),
    fechaNacimiento,
    edad: calcularEdad(fechaNacimiento, edadManual),
    genero: getOptional(formData, "genero"),
    telefono: getString(formData, "telefono"),
    email: getOptional(formData, "email"),
    direccion: getOptional(formData, "direccion"),
    ocupacion: getOptional(formData, "ocupacion"),
    notas: getOptional(formData, "notas"),
  };
}

function validar(data: ReturnType<typeof leerPaciente>) {
  const errors: Record<string, string> = {};
  if (!data.cedula) errors.cedula = "La cédula o RUC es obligatoria";
  else if (!/^[0-9A-Za-z-]{5,20}$/.test(data.cedula))
    errors.cedula = "Ingresa una cédula o RUC válido";
  if (!data.nombres) errors.nombres = "Ingresa los nombres";
  if (!data.apellidos) errors.apellidos = "Ingresa los apellidos";
  if (!data.telefono) errors.telefono = "Ingresa un teléfono de contacto";
  return errors;
}

function toDbDate(value: Date | null): Date | null {
  return value;
}

export async function crearPaciente(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const data = leerPaciente(formData);
  const errors = validar(data);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados", errors };
  }

  try {
    if (!prisma) {
      const store = getStore();
      const existe = store.pacientes.some(
        (p) => p.cedula.toLowerCase() === data.cedula.toLowerCase(),
      );
      if (existe) {
        return {
          ok: false,
          message: "Ya existe un paciente con esa cédula",
          errors: { cedula: "Cédula registrada previamente" },
        };
      }
      demoCrearPaciente(data);
    } else {
      const existe = await prisma.paciente.findUnique({ where: { cedula: data.cedula } });
      if (existe) {
        return {
          ok: false,
          message: "Ya existe un paciente con esa cédula",
          errors: { cedula: "Cédula registrada previamente" },
        };
      }
      await prisma.paciente.create({
        data: {
          cedula: data.cedula,
          nombres: data.nombres,
          apellidos: data.apellidos,
          fechaNacimiento: toDbDate(data.fechaNacimiento),
          edad: data.edad,
          genero: data.genero,
          telefono: data.telefono,
          email: data.email,
          direccion: data.direccion,
          ocupacion: data.ocupacion,
          notas: data.notas,
        },
      });
    }

    revalidatePath("/pacientes");
    revalidatePath("/dashboard");
    return { ok: true, message: "Paciente registrado correctamente" };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Ya existe un paciente con esa cédula",
        errors: { cedula: "Cédula registrada previamente" },
      };
    }
    console.error("[crearPaciente]", error);
    return { ok: false, message: "No se pudo registrar el paciente" };
  }
}

export async function actualizarPaciente(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const id = getString(formData, "id");
  if (!id) return { ok: false, message: "Paciente no identificado" };

  const data = leerPaciente(formData);
  const errors = validar(data);
  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados", errors };
  }

  try {
    if (!prisma) {
      const store = getStore();
      const duplicado = store.pacientes.some(
        (p) => p.id !== id && p.cedula.toLowerCase() === data.cedula.toLowerCase(),
      );
      if (duplicado) {
        return {
          ok: false,
          message: "Ya existe un paciente con esa cédula",
          errors: { cedula: "Cédula registrada previamente" },
        };
      }
      const actualizado = demoActualizarPaciente(id, {
        ...data,
        fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.toISOString() : null,
      });
      if (!actualizado) return { ok: false, message: "El paciente no existe" };
    } else {
      const duplicado = await prisma.paciente.findFirst({
        where: { cedula: data.cedula, NOT: { id } },
      });
      if (duplicado) {
        return {
          ok: false,
          message: "Ya existe un paciente con esa cédula",
          errors: { cedula: "Cédula registrada previamente" },
        };
      }
      await prisma.paciente.update({
        where: { id },
        data: {
          cedula: data.cedula,
          nombres: data.nombres,
          apellidos: data.apellidos,
          fechaNacimiento: toDbDate(data.fechaNacimiento),
          edad: data.edad,
          genero: data.genero,
          telefono: data.telefono,
          email: data.email,
          direccion: data.direccion,
          ocupacion: data.ocupacion,
          notas: data.notas,
        },
      });
    }

    revalidatePath("/pacientes");
    revalidatePath(`/pacientes/${id}`);
    revalidatePath(`/pacientes/${id}/historial`);
    return { ok: true, message: "Paciente actualizado correctamente" };
  } catch (error) {
    console.error("[actualizarPaciente]", error);
    return { ok: false, message: "No se pudo actualizar el paciente" };
  }
}

export async function eliminarPaciente(id: string): Promise<ActionState> {
  if (!id) return { ok: false, message: "Paciente no identificado" };
  try {
    if (!prisma) {
      const eliminado = demoEliminarPaciente(id);
      if (!eliminado) return { ok: false, message: "El paciente no existe" };
    } else {
      await prisma.paciente.update({ where: { id }, data: { activo: false } });
    }
    revalidatePath("/pacientes");
    revalidatePath("/dashboard");
    return { ok: true, message: "Paciente archivado correctamente" };
  } catch (error) {
    console.error("[eliminarPaciente]", error);
    return { ok: false, message: "No se pudo archivar el paciente" };
  }
}

export async function reactivarPaciente(id: string): Promise<ActionState> {
  if (!id) return { ok: false, message: "Paciente no identificado" };
  try {
    if (!prisma) {
      const paciente = getStore().pacientes.find((p) => p.id === id);
      if (!paciente) return { ok: false, message: "El paciente no existe" };
      paciente.activo = true;
    } else {
      await prisma.paciente.update({ where: { id }, data: { activo: true } });
    }
    revalidatePath("/pacientes");
    return { ok: true, message: "Paciente reactivado" };
  } catch (error) {
    console.error("[reactivarPaciente]", error);
    return { ok: false, message: "No se pudo reactivar el paciente" };
  }
}

export type { Paciente };
