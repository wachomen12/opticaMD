import { getDataset } from "@/lib/data";
import { getDashboardData } from "@/lib/accounting";
import { csvEscape, monthLabel, parseMonthParam } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { mes, anio } = parseMonthParam(searchParams.get("mes") ?? undefined);
  const dataset = await getDataset();
  const data = getDashboardData(dataset, mes, anio);
  const { kpis } = data;

  const rows: Array<Array<string | number>> = [
    ["ÓPTICA MD - REPORTE CONTABLE MENSUAL"],
    ["Vemos por ti, cuidamos tu visión"],
    ["Período", monthLabel(mes, anio)],
    ["Generado", new Date().toLocaleString("es-EC")],
    [],
    ["RESUMEN DEL MES"],
    ["Concepto", "Valor USD"],
    ["Ventas facturadas", kpis.ventas.toFixed(2)],
    ["Ingresos cobrados", kpis.cobrado.toFixed(2)],
    ["Cuentas por cobrar del mes", kpis.porCobrarMes.toFixed(2)],
    ["Compras", kpis.compras.toFixed(2)],
    ["Gastos operativos", kpis.gastos.toFixed(2)],
    ["Utilidad neta (cobrada)", kpis.utilidad.toFixed(2)],
    ["Margen sobre ingresos cobrados (%)", kpis.margen.toFixed(1)],
    [],
    ["VENTAS DEL MES"],
    ["Comprobante", "Fecha", "Cliente", "Categoría", "Detalle", "Total", "Abonado", "Saldo", "Estado", "Entrega"],
    ...dataset.ventas
      .filter((venta) => {
        const fecha = new Date(venta.fecha);
        return fecha.getMonth() === mes && fecha.getFullYear() === anio;
      })
      .sort((a, b) => +new Date(a.fecha) - +new Date(b.fecha))
      .map((venta) => {
        const paciente = venta.pacienteId
          ? dataset.pacientes.find((p) => p.id === venta.pacienteId)
          : undefined;
        const abonado = venta.pagos.reduce((sum, pago) => sum + pago.monto, 0);
        return [
          venta.codigo,
          new Date(venta.fecha).toLocaleDateString("es-EC"),
          paciente ? `${paciente.nombres} ${paciente.apellidos}` : venta.clienteNombre ?? "Cliente ocasional",
          venta.categoria,
          venta.descripcion,
          venta.total.toFixed(2),
          abonado.toFixed(2),
          Math.max(0, venta.total - abonado).toFixed(2),
          venta.estadoPago,
          venta.estadoEntrega,
        ];
      }),
    [],
    ["COMPRAS DEL MES"],
    ["Fecha", "Proveedor", "RUC", "Comprobante", "Categoría", "Detalle", "Total"],
    ...dataset.compras
      .filter((compra) => {
        const fecha = new Date(compra.fecha);
        return fecha.getMonth() === mes && fecha.getFullYear() === anio;
      })
      .sort((a, b) => +new Date(a.fecha) - +new Date(b.fecha))
      .map((compra) => [
        new Date(compra.fecha).toLocaleDateString("es-EC"),
        compra.proveedor,
        compra.proveedorRuc ?? "",
        compra.numeroComprobante ?? "",
        compra.categoria,
        compra.descripcion,
        compra.total.toFixed(2),
      ]),
    [],
    ["GASTOS OPERATIVOS DEL MES"],
    ["Fecha", "Categoría", "Descripción", "Recurrente", "Comprobante", "Monto"],
    ...dataset.gastos
      .filter((gasto) => {
        const fecha = new Date(gasto.fecha);
        return fecha.getMonth() === mes && fecha.getFullYear() === anio;
      })
      .sort((a, b) => +new Date(a.fecha) - +new Date(b.fecha))
      .map((gasto) => [
        new Date(gasto.fecha).toLocaleDateString("es-EC"),
        gasto.categoria,
        gasto.descripcion,
        gasto.recurrente ? "Sí" : "No",
        gasto.comprobante ?? "",
        gasto.monto.toFixed(2),
      ]),
    [],
    ["TOTALES"],
    ["Ingresos cobrados", "", "", "", "", "", "", "", kpis.cobrado.toFixed(2)],
    ["Compras + gastos", "", "", "", "", "", "", "", (kpis.compras + kpis.gastos).toFixed(2)],
    ["Utilidad neta", "", "", "", "", "", "", "", kpis.utilidad.toFixed(2)],
  ];

  const csv = rows.map((row) => row.map(csvEscape).join(";")).join("\r\n");
  const filename = `optica-md-reporte-${anio}-${String(mes + 1).padStart(2, "0")}.csv`;

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
