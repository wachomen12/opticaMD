import {
  CATEGORIA_COMPRA_LABEL,
  CATEGORIA_GASTO_COLOR,
  CATEGORIA_GASTO_LABEL,
  CATEGORIA_VENTA_DOT,
  CATEGORIA_VENTA_LABEL,
} from "./constants";
import { isInMonth, monthNameShort, previousMonth } from "./format";
import type { Dataset, Venta } from "./types";

// ─────────────────────────────────────────────────────────────
//  Motor contable — cálculo de KPIs y flujo de caja
// ─────────────────────────────────────────────────────────────

export type Kpis = {
  ventas: number;
  cobrado: number;
  porCobrarMes: number;
  compras: number;
  gastos: number;
  utilidad: number;
  margen: number;
  count: number;
  ticket: number;
};

export type MonthPoint = Kpis & {
  mes: number;
  anio: number;
  label: string;
  key: string;
};

export type CategoriaTotal = {
  key: string;
  label: string;
  total: number;
  count: number;
  color: string;
};

export type Movimiento = {
  id: string;
  tipo: "VENTA" | "COMPRA" | "GASTO";
  fecha: string;
  descripcion: string;
  contraparte: string;
  monto: number;
  estado?: string;
  categoria: string;
};

export function ventaPagado(venta: Venta): number {
  return Math.round(venta.pagos.reduce((sum, pago) => sum + pago.monto, 0) * 100) / 100;
}

export function ventaSaldo(venta: Venta): number {
  return Math.max(0, Math.round((venta.total - ventaPagado(venta)) * 100) / 100);
}

export function porcentaje(value: number, total: number): number {
  return total > 0 ? Math.round((value / total) * 100) : 0;
}

function buildKpis(
  dataset: Dataset,
  mes: number,
  anio: number,
): Kpis {
  const ventasMes = dataset.ventas.filter((v) => isInMonth(v.fecha, mes, anio));
  const comprasMes = dataset.compras.filter((c) => isInMonth(c.fecha, mes, anio));
  const gastosMes = dataset.gastos.filter((g) => isInMonth(g.fecha, mes, anio));

  const ventas = ventasMes.reduce((s, v) => s + v.total, 0);
  const compras = comprasMes.reduce((s, c) => s + c.total, 0);
  const gastos = gastosMes.reduce((s, g) => s + g.monto, 0);

  const cobrado = dataset.ventas.reduce(
    (sum, venta) =>
      sum +
      venta.pagos
        .filter((pago) => isInMonth(pago.fecha, mes, anio))
        .reduce((s, pago) => s + pago.monto, 0),
    0,
  );

  const porCobrarMes = ventasMes.reduce((s, v) => s + ventaSaldo(v), 0);
  const utilidad = cobrado - compras - gastos;

  return {
    ventas: Math.round(ventas * 100) / 100,
    cobrado: Math.round(cobrado * 100) / 100,
    porCobrarMes: Math.round(porCobrarMes * 100) / 100,
    compras: Math.round(compras * 100) / 100,
    gastos: Math.round(gastos * 100) / 100,
    utilidad: Math.round(utilidad * 100) / 100,
    margen: cobrado > 0 ? Math.round((utilidad / cobrado) * 1000) / 10 : 0,
    count: ventasMes.length,
    ticket: ventasMes.length ? Math.round((ventas / ventasMes.length) * 100) / 100 : 0,
  };
}

export function getSeries(dataset: Dataset, mes: number, anio: number, months = 6): MonthPoint[] {
  const points: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(anio, mes - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    points.push({
      ...buildKpis(dataset, m, y),
      mes: m,
      anio: y,
      label: `${monthNameShort(m)} ${String(y).slice(2)}`,
      key: `${y}-${m}`,
    });
  }
  return points;
}

export function getGastosPorCategoria(
  dataset: Dataset,
  mes: number,
  anio: number,
): CategoriaTotal[] {
  const map = new Map<string, CategoriaTotal>();
  for (const gasto of dataset.gastos) {
    if (!isInMonth(gasto.fecha, mes, anio)) continue;
    const current = map.get(gasto.categoria) ?? {
      key: gasto.categoria,
      label: CATEGORIA_GASTO_LABEL[gasto.categoria],
      total: 0,
      count: 0,
      color: CATEGORIA_GASTO_COLOR[gasto.categoria],
    };
    current.total += gasto.monto;
    current.count += 1;
    map.set(gasto.categoria, current);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function getComprasPorCategoria(
  dataset: Dataset,
  mes: number,
  anio: number,
): CategoriaTotal[] {
  const map = new Map<string, CategoriaTotal>();
  for (const compra of dataset.compras) {
    if (!isInMonth(compra.fecha, mes, anio)) continue;
    const current = map.get(compra.categoria) ?? {
      key: compra.categoria,
      label: CATEGORIA_COMPRA_LABEL[compra.categoria],
      total: 0,
      count: 0,
      color: CATEGORIA_VENTA_DOT.ARMAZONES,
    };
    current.total += compra.total;
    current.count += 1;
    map.set(compra.categoria, current);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function getVentasPorCategoria(
  dataset: Dataset,
  mes: number,
  anio: number,
): CategoriaTotal[] {
  const map = new Map<string, CategoriaTotal>();
  for (const venta of dataset.ventas) {
    if (!isInMonth(venta.fecha, mes, anio)) continue;
    const current = map.get(venta.categoria) ?? {
      key: venta.categoria,
      label: CATEGORIA_VENTA_LABEL[venta.categoria],
      total: 0,
      count: 0,
      color: CATEGORIA_VENTA_DOT[venta.categoria],
    };
    current.total += venta.total;
    current.count += 1;
    map.set(venta.categoria, current);
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function getMovimientos(dataset: Dataset, mes: number, anio: number): Movimiento[] {
  const pacientes = new Map(dataset.pacientes.map((p) => [p.id, p]));
  const movimientos: Movimiento[] = [];

  for (const venta of dataset.ventas) {
    if (!isInMonth(venta.fecha, mes, anio)) continue;
    const paciente = venta.pacienteId ? pacientes.get(venta.pacienteId) : undefined;
    movimientos.push({
      id: venta.id,
      tipo: "VENTA",
      fecha: venta.fecha,
      descripcion: venta.descripcion,
      contraparte: paciente
        ? `${paciente.nombres} ${paciente.apellidos}`
        : venta.clienteNombre || "Cliente ocasional",
      monto: venta.total,
      estado: venta.estadoPago,
      categoria: CATEGORIA_VENTA_LABEL[venta.categoria],
    });
  }

  for (const compra of dataset.compras) {
    if (!isInMonth(compra.fecha, mes, anio)) continue;
    movimientos.push({
      id: compra.id,
      tipo: "COMPRA",
      fecha: compra.fecha,
      descripcion: compra.descripcion,
      contraparte: compra.proveedor,
      monto: compra.total,
      categoria: CATEGORIA_COMPRA_LABEL[compra.categoria],
    });
  }

  for (const gasto of dataset.gastos) {
    if (!isInMonth(gasto.fecha, mes, anio)) continue;
    movimientos.push({
      id: gasto.id,
      tipo: "GASTO",
      fecha: gasto.fecha,
      descripcion: gasto.descripcion,
      contraparte: gasto.recurrente ? "Gasto recurrente" : "Gasto operativo",
      monto: gasto.monto,
      categoria: CATEGORIA_GASTO_LABEL[gasto.categoria],
    });
  }

  return movimientos.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}

export type DashboardData = {
  mes: number;
  anio: number;
  kpis: Kpis;
  anterior: Kpis;
  series: MonthPoint[];
  gastosCategorias: CategoriaTotal[];
  comprasCategorias: CategoriaTotal[];
  ventasCategorias: CategoriaTotal[];
  recientes: Movimiento[];
  movimientos: Movimiento[];
  porCobrarTotal: number;
  saldoAFavor: number;
  enTaller: number;
  clientesActivos: number;
  comprasPendientes: number;
};

export function getDashboardData(
  dataset: Dataset,
  mes: number,
  anio: number,
): DashboardData {
  const kpis = buildKpis(dataset, mes, anio);
  const prev = previousMonth(mes, anio);
  const anterior = buildKpis(dataset, prev.mes, prev.anio);

  const porCobrarTotal = dataset.ventas
    .filter((v) => v.estadoPago !== "PAGADA")
    .reduce((s, v) => s + ventaSaldo(v), 0);

  return {
    mes,
    anio,
    kpis,
    anterior,
    series: getSeries(dataset, mes, anio, 6),
    gastosCategorias: getGastosPorCategoria(dataset, mes, anio),
    comprasCategorias: getComprasPorCategoria(dataset, mes, anio),
    ventasCategorias: getVentasPorCategoria(dataset, mes, anio),
    recientes: getMovimientos(dataset, mes, anio).slice(0, 12),
    movimientos: getMovimientos(dataset, mes, anio),
    porCobrarTotal: Math.round(porCobrarTotal * 100) / 100,
    saldoAFavor: 0,
    enTaller: dataset.ventas.filter((v) => v.estadoEntrega !== "ENTREGADO").length,
    clientesActivos: dataset.pacientes.filter((p) => p.activo).length,
    comprasPendientes: 0,
  };
}

export function variacion(actual: number, anterior: number): number | null {
  if (anterior === 0) return actual === 0 ? 0 : null;
  return ((actual - anterior) / Math.abs(anterior)) * 100;
}
