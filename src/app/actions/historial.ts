"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  demoActualizarHistoria,
  demoActualizarPaciente,
  demoCrearHistoria,
} from "@/lib/demo-store";
import { getHistoria, getHistoriasPaciente, getPaciente } from "@/lib/data";
import { getBoolean, getNumber, getOptional, getString, parseDateInput } from "@/lib/form";
import { prisma } from "@/lib/prisma";
import type { ActionState, HistoriaClinica, HistoriaClinicaInput } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
//  HISTORIAL CLÍNICO OPTOMÉTRICO
// ─────────────────────────────────────────────────────────────

function getList(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

function leerHistoria(formData: FormData, pacienteId: string): HistoriaClinicaInput {
  const fecha = parseDateInput(getString(formData, "fecha"));
  const motivosConsulta = getList(formData, "motivosConsulta");
  const antecedentesPatologicos = getList(formData, "antecedentesPatologicos");
  const antecedentesOftalmologicos = getList(formData, "antecedentesOftalmologicos");
  const antecedentesFamiliares = getList(formData, "antecedentesFamiliares");
  const diagnosticos = getList(formData, "diagnosticos");
  const tipoLenteRecomendado = getList(formData, "tipoLenteRecomendado");
  const tratamientosRecomendados = getList(formData, "tratamientosRecomendados");
  return {
    fecha: fecha.toISOString(),
    usaLentes: getBoolean(formData, "usaLentes"),
    ultimoControlVisual: getOptional(formData, "ultimoControlVisual"),
    ultimoCambioLentes: getOptional(formData, "ultimoCambioLentes"),

    motivosConsulta,
    motivoConsultaOtros: motivosConsulta.includes("Otros")
      ? getOptional(formData, "motivoConsultaOtros")
      : null,

    antecedentesPatologicos,
    antecedentesPatologicosOtros: antecedentesPatologicos.includes("Otros")
      ? getOptional(formData, "antecedentesPatologicosOtros")
      : null,
    antecedentesOftalmologicos,
    antecedentesOftalmologicosOtros: antecedentesOftalmologicos.includes("Otros")
      ? getOptional(formData, "antecedentesOftalmologicosOtros")
      : null,
    antecedentesFamiliares,
    antecedentesFamiliaresOtros: antecedentesFamiliares.includes("Otros")
      ? getOptional(formData, "antecedentesFamiliaresOtros")
      : null,

    avSinCorreccionVL_OD: getOptional(formData, "avSinCorreccionVL_OD"),
    avSinCorreccionVL_OI: getOptional(formData, "avSinCorreccionVL_OI"),
    avSinCorreccionVP_OD: getOptional(formData, "avSinCorreccionVP_OD"),
    avSinCorreccionVP_OI: getOptional(formData, "avSinCorreccionVP_OI"),
    avConCorreccionVL_OD: getOptional(formData, "avConCorreccionVL_OD"),
    avConCorreccionVL_OI: getOptional(formData, "avConCorreccionVL_OI"),
    avConCorreccionVP_OD: getOptional(formData, "avConCorreccionVP_OD"),
    avConCorreccionVP_OI: getOptional(formData, "avConCorreccionVP_OI"),

    papilaOptica: getOptional(formData, "papilaOptica"),
    macula: getOptional(formData, "macula"),
    retina: getOptional(formData, "retina"),
    observacionesSegmentoPosterior: getOptional(formData, "observacionesSegmentoPosterior"),

    diagnosticos,
    diagnosticoOtro: diagnosticos.includes("Otro")
      ? getOptional(formData, "diagnosticoOtro")
      : null,

    esfera_OD: getOptional(formData, "esfera_OD"),
    esfera_OI: getOptional(formData, "esfera_OI"),
    cilindro_OD: getOptional(formData, "cilindro_OD"),
    cilindro_OI: getOptional(formData, "cilindro_OI"),
    eje_OD: getOptional(formData, "eje_OD"),
    eje_OI: getOptional(formData, "eje_OI"),
    adicion_OD: getOptional(formData, "adicion_OD"),
    adicion_OI: getOptional(formData, "adicion_OI"),
    altura_OD: getOptional(formData, "altura_OD"),
    altura_OI: getOptional(formData, "altura_OI"),
    dnp_OD: getOptional(formData, "dnp_OD"),
    dnp_OI: getOptional(formData, "dnp_OI"),
    avFinal_OD: getOptional(formData, "avFinal_OD"),
    avFinal_OI: getOptional(formData, "avFinal_OI"),

    tipoLenteRecomendado,
    tipoLenteOtro: tipoLenteRecomendado.includes("Otro")
      ? getOptional(formData, "tipoLenteOtro")
      : null,
    tratamientosRecomendados,
    tratamientoOtro: tratamientosRecomendados.includes("Otro")
      ? getOptional(formData, "tratamientoOtro")
      : null,

    pacienteId,
    ventaId: null,
  };
}

function leerFiliacion(formData: FormData) {
  const edadRaw = getNumber(formData, "edad");
  return {
    edad: edadRaw > 0 && edadRaw < 130 ? Math.round(edadRaw) : null,
    genero: getOptional(formData, "genero"),
    ocupacion: getOptional(formData, "ocupacion"),
    telefono: getString(formData, "telefono"),
    direccion: getOptional(formData, "direccion"),
  };
}

async function actualizarFiliacion(
  pacienteId: string,
  data: ReturnType<typeof leerFiliacion>,
): Promise<void> {
  if (!prisma) {
    demoActualizarPaciente(pacienteId, data);
    return;
  }
  await prisma.paciente.update({ where: { id: pacienteId }, data });
}

export async function guardarHistoria(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const pacienteId = getString(formData, "pacienteId");
  const historiaId = getString(formData, "id") || null;
  if (!pacienteId) return { ok: false, message: "Paciente no identificado" };

  const paciente = await getPaciente(pacienteId);
  if (!paciente) return { ok: false, message: "El paciente ya no existe" };

  const filiacion = leerFiliacion(formData);
  const errors: Record<string, string> = {};
  if (!filiacion.telefono) errors.telefono = "Ingresa un teléfono de contacto";

  if (Object.keys(errors).length > 0) {
    return { ok: false, message: "Revisa los campos marcados", errors };
  }

  const input = leerHistoria(formData, pacienteId);
  const existente = historiaId ? await getHistoria(historiaId) : null;
  if (historiaId && (!existente || existente.pacienteId !== pacienteId)) {
    return { ok: false, message: "La historia clínica no existe o no pertenece al paciente" };
  }

  try {
    await actualizarFiliacion(pacienteId, filiacion);

    let id = historiaId;
    if (!prisma) {
      if (historiaId) {
        const actualizada = demoActualizarHistoria(historiaId, {
          ...input,
          ventaId: existente?.ventaId ?? null,
        });
        if (!actualizada) return { ok: false, message: "La historia clínica no existe" };
      } else {
        id = demoCrearHistoria(input).id;
      }
    } else if (historiaId) {
      await prisma.historiaClinica.update({
        where: { id: historiaId },
        data: {
          fecha: new Date(input.fecha),
          usaLentes: input.usaLentes,
          ultimoControlVisual: input.ultimoControlVisual,
          ultimoCambioLentes: input.ultimoCambioLentes,
          motivosConsulta: input.motivosConsulta,
          motivoConsultaOtros: input.motivoConsultaOtros,
          antecedentesPatologicos: input.antecedentesPatologicos,
          antecedentesPatologicosOtros: input.antecedentesPatologicosOtros,
          antecedentesOftalmologicos: input.antecedentesOftalmologicos,
          antecedentesOftalmologicosOtros: input.antecedentesOftalmologicosOtros,
          antecedentesFamiliares: input.antecedentesFamiliares,
          antecedentesFamiliaresOtros: input.antecedentesFamiliaresOtros,
          avSinCorreccionVL_OD: input.avSinCorreccionVL_OD,
          avSinCorreccionVL_OI: input.avSinCorreccionVL_OI,
          avSinCorreccionVP_OD: input.avSinCorreccionVP_OD,
          avSinCorreccionVP_OI: input.avSinCorreccionVP_OI,
          avConCorreccionVL_OD: input.avConCorreccionVL_OD,
          avConCorreccionVL_OI: input.avConCorreccionVL_OI,
          avConCorreccionVP_OD: input.avConCorreccionVP_OD,
          avConCorreccionVP_OI: input.avConCorreccionVP_OI,
          papilaOptica: input.papilaOptica,
          macula: input.macula,
          retina: input.retina,
          observacionesSegmentoPosterior: input.observacionesSegmentoPosterior,
          diagnosticos: input.diagnosticos,
          diagnosticoOtro: input.diagnosticoOtro,
          esfera_OD: input.esfera_OD,
          esfera_OI: input.esfera_OI,
          cilindro_OD: input.cilindro_OD,
          cilindro_OI: input.cilindro_OI,
          eje_OD: input.eje_OD,
          eje_OI: input.eje_OI,
          adicion_OD: input.adicion_OD,
          adicion_OI: input.adicion_OI,
          altura_OD: input.altura_OD,
          altura_OI: input.altura_OI,
          dnp_OD: input.dnp_OD,
          dnp_OI: input.dnp_OI,
          avFinal_OD: input.avFinal_OD,
          avFinal_OI: input.avFinal_OI,
          tipoLenteRecomendado: input.tipoLenteRecomendado,
          tipoLenteOtro: input.tipoLenteOtro,
          tratamientosRecomendados: input.tratamientosRecomendados,
          tratamientoOtro: input.tratamientoOtro,
        },
      });
    } else {
      const count = await prisma.historiaClinica.count();
      for (let intento = 0; intento < 5; intento++) {
        const numeroHistoria = `HC-${String(count + 1 + intento).padStart(4, "0")}`;
        try {
          const creada = await prisma.historiaClinica.create({
            data: {
              numeroHistoria,
              fecha: new Date(input.fecha),
              usaLentes: input.usaLentes,
              ultimoControlVisual: input.ultimoControlVisual,
              ultimoCambioLentes: input.ultimoCambioLentes,
              motivosConsulta: input.motivosConsulta,
              motivoConsultaOtros: input.motivoConsultaOtros,
              antecedentesPatologicos: input.antecedentesPatologicos,
              antecedentesPatologicosOtros: input.antecedentesPatologicosOtros,
              antecedentesOftalmologicos: input.antecedentesOftalmologicos,
              antecedentesOftalmologicosOtros: input.antecedentesOftalmologicosOtros,
              antecedentesFamiliares: input.antecedentesFamiliares,
              antecedentesFamiliaresOtros: input.antecedentesFamiliaresOtros,
              avSinCorreccionVL_OD: input.avSinCorreccionVL_OD,
              avSinCorreccionVL_OI: input.avSinCorreccionVL_OI,
              avSinCorreccionVP_OD: input.avSinCorreccionVP_OD,
              avSinCorreccionVP_OI: input.avSinCorreccionVP_OI,
              avConCorreccionVL_OD: input.avConCorreccionVL_OD,
              avConCorreccionVL_OI: input.avConCorreccionVL_OI,
              avConCorreccionVP_OD: input.avConCorreccionVP_OD,
              avConCorreccionVP_OI: input.avConCorreccionVP_OI,
              papilaOptica: input.papilaOptica,
              macula: input.macula,
              retina: input.retina,
              observacionesSegmentoPosterior: input.observacionesSegmentoPosterior,
              diagnosticos: input.diagnosticos,
              diagnosticoOtro: input.diagnosticoOtro,
              esfera_OD: input.esfera_OD,
              esfera_OI: input.esfera_OI,
              cilindro_OD: input.cilindro_OD,
              cilindro_OI: input.cilindro_OI,
              eje_OD: input.eje_OD,
              eje_OI: input.eje_OI,
              adicion_OD: input.adicion_OD,
              adicion_OI: input.adicion_OI,
              altura_OD: input.altura_OD,
              altura_OI: input.altura_OI,
              dnp_OD: input.dnp_OD,
              dnp_OI: input.dnp_OI,
              avFinal_OD: input.avFinal_OD,
              avFinal_OI: input.avFinal_OI,
              tipoLenteRecomendado: input.tipoLenteRecomendado,
              tipoLenteOtro: input.tipoLenteOtro,
              tratamientosRecomendados: input.tratamientosRecomendados,
              tratamientoOtro: input.tratamientoOtro,
              pacienteId,
            },
          });
          id = creada.id;
          break;
        } catch (error) {
          const duplicado =
            error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
          if (!duplicado || intento === 4) throw error;
        }
      }
    }

    revalidatePath("/pacientes");
    revalidatePath(`/pacientes/${pacienteId}`);
    revalidatePath(`/pacientes/${pacienteId}/historial`);

    return {
      ok: true,
      message: historiaId
        ? "Historia clínica actualizada correctamente"
        : "Historia clínica creada correctamente",
      id: id ?? undefined,
    };
  } catch (error) {
    console.error("[guardarHistoria]", error);
    return { ok: false, message: "No se pudo guardar la historia clínica" };
  }
}

export async function listarHistorias(pacienteId: string): Promise<HistoriaClinica[]> {
  if (!pacienteId) return [];
  return getHistoriasPaciente(pacienteId);
}

export async function obtenerHistoria(id: string): Promise<HistoriaClinica | null> {
  if (!id) return null;
  return getHistoria(id);
}
