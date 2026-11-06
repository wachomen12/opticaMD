import type { HistoriaClinica } from "./types";

// ─────────────────────────────────────────────────────────────
//  Catálogos del formulario clínico optométrico
// ─────────────────────────────────────────────────────────────

export const GENERO_OPTIONS = [
  { value: "Femenino", label: "Femenino" },
  { value: "Masculino", label: "Masculino" },
  { value: "Otro", label: "Otro" },
  { value: "Prefiero no indicar", label: "Prefiero no indicar" },
] as const;

export const MOTIVOS_CONSULTA = [
  "Visión borrosa de lejos",
  "Visión borrosa de cerca",
  "Dolor de cabeza",
  "Fatiga visual",
  "Ardor ocular",
  "Lagrimeo",
  "Picazón ocular",
  "Sensación de cuerpo extraño",
  "Distorsión",
  "Enrojecimiento ocular",
  "Caspa ocular",
  "Control visual",
  "Renovación de lentes",
  "Otros",
] as const;

export const ANTECEDENTES_PATOLOGICOS = [
  "Diabetes",
  "Hipertensión arterial",
  "Enfermedades tiroides",
  "Alergias",
  "Otros",
  "Ninguno",
] as const;

export const ANTECEDENTES_OFTALMOLOGICOS = [
  "Uso de lente",
  "Cirugía ocular",
  "Traumatismo ocular",
  "Glaucoma",
  "Catarata",
  "Estrabismo",
  "Otros",
  "Ninguno",
] as const;

export const ANTECEDENTES_FAMILIARES = [
  "Diabetes",
  "Hipertensión",
  "Glaucoma",
  "Catarata",
  "Miopía",
  "Hipermetropía",
  "Otros",
] as const;

export const DIAGNOSTICOS = [
  "Miopía",
  "Hipermetropía",
  "Astigmatismo",
  "Presbicia",
  "Alteración acomodativa",
  "Alteración binocular",
  "Otro",
] as const;

export const TIPOS_LENTE = ["Monofocal", "Bifocal", "Progresivo", "Otro"] as const;

export const TRATAMIENTOS = [
  "Antirreflejo",
  "Filtro UV",
  "Filtro de luz azul",
  "Fotocromático",
  "Polarizado",
  "Otro",
] as const;

export const AV_FILAS = [
  {
    label: "Visión lejana (VL) sin corrección",
    od: "avSinCorreccionVL_OD",
    oi: "avSinCorreccionVL_OI",
  },
  {
    label: "Visión lejana (VL) con corrección",
    od: "avConCorreccionVL_OD",
    oi: "avConCorreccionVL_OI",
  },
  {
    label: "Visión próxima (VP) sin corrección",
    od: "avSinCorreccionVP_OD",
    oi: "avSinCorreccionVP_OI",
  },
  {
    label: "Visión próxima (VP) con corrección",
    od: "avConCorreccionVP_OD",
    oi: "avConCorreccionVP_OI",
  },
] as const;

export const RX_FILAS = [
  { label: "Esfera", od: "esfera_OD", oi: "esfera_OI", placeholder: "-1.25" },
  { label: "Cilindro", od: "cilindro_OD", oi: "cilindro_OI", placeholder: "-0.50" },
  { label: "Eje", od: "eje_OD", oi: "eje_OI", placeholder: "180°" },
  { label: "Adición", od: "adicion_OD", oi: "adicion_OI", placeholder: "+2.00" },
  { label: "Altura", od: "altura_OD", oi: "altura_OI", placeholder: "18 mm" },
  { label: "DNP", od: "dnp_OD", oi: "dnp_OI", placeholder: "31 mm" },
  { label: "AV final", od: "avFinal_OD", oi: "avFinal_OI", placeholder: "20/20" },
] as const;

/** Resumen legible de la receta, usado para precargar la venta. */
export function resumenReceta(historia: HistoriaClinica): string {
  const lentes = historia.tipoLenteRecomendado.length
    ? historia.tipoLenteRecomendado.join(" + ")
    : "Lunas";
  const tratamientos = historia.tratamientosRecomendados.length
    ? ` + ${historia.tratamientosRecomendados.join(" + ")}`
    : "";
  const numero = historia.numeroHistoria.replace(/^HC[- ]?/i, "");
  return `Lente ${lentes}${tratamientos} - Según HC #${numero}`;
}

export function parseNumeroHistoria(numero: string): string {
  return numero.replace(/^HC[- ]?/i, "");
}
