import type {
  CategoriaCompra,
  CategoriaGasto,
  CategoriaVenta,
  EstadoEntrega,
  EstadoPago,
  MetodoPago,
} from "./types";

export const CATEGORIA_VENTA_LABEL: Record<CategoriaVenta, string> = {
  LUNAS: "Lunas / Cristales",
  LENTE_COMPLETO: "Lente completo",
  ARMAZONES: "Armazones",
  LENTES_CONTACTO: "Lentes de contacto",
  ACCESORIOS: "Líquidos y accesorios",
  CONSULTA: "Consulta optométrica",
};

export const CATEGORIA_VENTA_OPTIONS = Object.entries(CATEGORIA_VENTA_LABEL).map(
  ([value, label]) => ({ value: value as CategoriaVenta, label }),
);

export const CATEGORIA_COMPRA_LABEL: Record<CategoriaCompra, string> = {
  ARMAZONES: "Armazones",
  LUNAS_LABORATORIO: "Lunas (laboratorio)",
  LENTES_CONTACTO: "Lentes de contacto",
  INSUMOS: "Insumos ópticos",
  EQUIPOS: "Equipos",
  OTROS: "Otros",
};

export const CATEGORIA_COMPRA_OPTIONS = Object.entries(CATEGORIA_COMPRA_LABEL).map(
  ([value, label]) => ({ value: value as CategoriaCompra, label }),
);

export const CATEGORIA_GASTO_LABEL: Record<CategoriaGasto, string> = {
  ARRIENDO: "Arriendo",
  SERVICIOS: "Servicios básicos",
  SUELDOS: "Sueldos y comisiones",
  MANTENIMIENTO: "Mantenimiento",
  PUBLICIDAD: "Publicidad",
  OTROS: "Otros gastos",
};

export const CATEGORIA_GASTO_OPTIONS = Object.entries(CATEGORIA_GASTO_LABEL).map(
  ([value, label]) => ({ value: value as CategoriaGasto, label }),
);

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  TRANSFERENCIA: "Transferencia",
  TARJETA: "Tarjeta",
};

export const METODO_PAGO_OPTIONS = Object.entries(METODO_PAGO_LABEL).map(
  ([value, label]) => ({ value: value as MetodoPago, label }),
);

export const ESTADO_PAGO_LABEL: Record<EstadoPago, string> = {
  PENDIENTE: "Pendiente",
  PARCIAL: "Abonado",
  PAGADA: "Pagada",
};

export const ESTADO_ENTREGA_LABEL: Record<EstadoEntrega, string> = {
  EN_TALLER: "En taller",
  LISTO: "Listo",
  ENTREGADO: "Entregado",
};

export const ESTADO_PAGO_STYLE: Record<EstadoPago, string> = {
  PENDIENTE: "bg-warning-soft text-amber-700 ring-amber-600/15",
  PARCIAL: "bg-primary-50 text-primary-700 ring-primary-600/15",
  PAGADA: "bg-success-soft text-emerald-700 ring-emerald-600/15",
};

export const ESTADO_ENTREGA_STYLE: Record<EstadoEntrega, string> = {
  EN_TALLER: "bg-warning-soft text-amber-700 ring-amber-600/15",
  LISTO: "bg-primary-50 text-primary-700 ring-primary-600/15",
  ENTREGADO: "bg-success-soft text-emerald-700 ring-emerald-600/15",
};

export const CATEGORIA_VENTA_DOT: Record<CategoriaVenta, string> = {
  LUNAS: "#235D92",
  LENTE_COMPLETO: "#DB2777",
  ARMAZONES: "#EA711B",
  LENTES_CONTACTO: "#0F9D76",
  ACCESORIOS: "#7C5CD6",
  CONSULTA: "#0EA5E9",
};

export const CATEGORIA_GASTO_COLOR: Record<CategoriaGasto, string> = {
  ARRIENDO: "#235D92",
  SERVICIOS: "#0EA5E9",
  SUELDOS: "#123568",
  MANTENIMIENTO: "#EA711B",
  PUBLICIDAD: "#7C5CD6",
  OTROS: "#94A3B8",
};

export const MESES = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const MESES_CORTOS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

export const NAV_ITEMS = [
  {
    group: "Clínica",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "LayoutDashboard",
        description: "Resumen financiero",
      },
      {
        label: "Pacientes e Historial",
        href: "/pacientes",
        icon: "Users",
        description: "Fichas clínicas",
      },
    ],
  },
  {
    group: "Finanzas",
    items: [
      { label: "Ventas", href: "/ventas", icon: "Receipt", description: "Ingresos y cobros" },
      {
        label: "Compras e Inventario",
        href: "/compras",
        icon: "PackageOpen",
        description: "Proveedores e insumos",
      },
      { label: "Gastos", href: "/gastos", icon: "Wallet", description: "Egresos operativos" },
      {
        label: "Reportes Contables",
        href: "/reportes",
        icon: "FileSpreadsheet",
        description: "Cierre mensual",
      },
    ],
  },
] as const;
