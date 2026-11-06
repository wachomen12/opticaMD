// ─────────────────────────────────────────────────────────────
//  Tipos de dominio — ÓPTICA MD
//  Contrato entre la capa de datos (Prisma) y la interfaz.
// ─────────────────────────────────────────────────────────────

export type CategoriaVenta =
  | "LUNAS"
  | "ARMAZONES"
  | "LENTES_CONTACTO"
  | "ACCESORIOS"
  | "CONSULTA";

export type CategoriaCompra =
  | "ARMAZONES"
  | "LUNAS_LABORATORIO"
  | "LENTES_CONTACTO"
  | "INSUMOS"
  | "EQUIPOS"
  | "OTROS";

export type CategoriaGasto =
  | "ARRIENDO"
  | "SERVICIOS"
  | "SUELDOS"
  | "MANTENIMIENTO"
  | "PUBLICIDAD"
  | "OTROS";

export type MetodoPago = "EFECTIVO" | "TRANSFERENCIA" | "TARJETA";
export type EstadoPago = "PENDIENTE" | "PARCIAL" | "PAGADA";
export type EstadoEntrega = "EN_TALLER" | "LISTO" | "ENTREGADO";

export interface Paciente {
  id: string;
  cedula?: string | null;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string | null;
  edad?: number | null;
  genero?: string | null;
  telefono: string;
  email?: string | null;
  direccion?: string | null;
  ocupacion?: string | null;
  notas?: string | null;
  activo: boolean;
  createdAt: string;
}

export interface PagoVenta {
  id: string;
  ventaId: string;
  monto: number;
  metodo: MetodoPago;
  fecha: string;
  nota?: string | null;
}

export interface Venta {
  id: string;
  codigo: string;
  fecha: string;
  categoria: CategoriaVenta;
  descripcion: string;
  total: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  estadoEntrega: EstadoEntrega;
  pacienteId?: string | null;
  clienteNombre?: string | null;
  notas?: string | null;
  pagos: PagoVenta[];
}

export interface Compra {
  id: string;
  fecha: string;
  proveedor: string;
  proveedorRuc?: string | null;
  numeroComprobante?: string | null;
  categoria: CategoriaCompra;
  descripcion: string;
  total: number;
}

export interface Gasto {
  id: string;
  fecha: string;
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  recurrente: boolean;
  comprobante?: string | null;
}

export interface HistoriaClinica {
  id: string;
  numeroHistoria: string;
  fecha: string;
  usaLentes: boolean;
  ultimoControlVisual?: string | null;
  ultimoCambioLentes?: string | null;

  motivosConsulta: string[];
  motivoConsultaOtros?: string | null;

  antecedentesPatologicos: string[];
  antecedentesPatologicosOtros?: string | null;
  antecedentesOftalmologicos: string[];
  antecedentesOftalmologicosOtros?: string | null;
  antecedentesFamiliares: string[];
  antecedentesFamiliaresOtros?: string | null;

  avSinCorreccionVL_OD?: string | null;
  avSinCorreccionVL_OI?: string | null;
  avSinCorreccionVP_OD?: string | null;
  avSinCorreccionVP_OI?: string | null;
  avConCorreccionVL_OD?: string | null;
  avConCorreccionVL_OI?: string | null;
  avConCorreccionVP_OD?: string | null;
  avConCorreccionVP_OI?: string | null;

  papilaOptica?: string | null;
  macula?: string | null;
  retina?: string | null;
  observacionesSegmentoPosterior?: string | null;

  diagnosticos: string[];
  diagnosticoOtro?: string | null;

  esfera_OD?: string | null;
  esfera_OI?: string | null;
  cilindro_OD?: string | null;
  cilindro_OI?: string | null;
  eje_OD?: string | null;
  eje_OI?: string | null;
  adicion_OD?: string | null;
  adicion_OI?: string | null;
  altura_OD?: string | null;
  altura_OI?: string | null;
  dnp_OD?: string | null;
  dnp_OI?: string | null;
  avFinal_OD?: string | null;
  avFinal_OI?: string | null;

  tipoLenteRecomendado: string[];
  tipoLenteOtro?: string | null;
  tratamientosRecomendados: string[];
  tratamientoOtro?: string | null;

  pacienteId: string;
  ventaId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type HistoriaClinicaInput = Omit<
  HistoriaClinica,
  "id" | "numeroHistoria" | "createdAt" | "updatedAt"
>;

export interface Dataset {
  pacientes: Paciente[];
  ventas: Venta[];
  compras: Compra[];
  gastos: Gasto[];
}

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  id?: string;
};
