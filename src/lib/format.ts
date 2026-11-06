import { MESES, MESES_CORTOS } from "./constants";

const currency = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const compact = new Intl.NumberFormat("es-EC", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function money(value: number): string {
  return currency.format(Number.isFinite(value) ? value : 0);
}

export function moneyCompact(value: number): string {
  return `$${compact.format(Number.isFinite(value) ? value : 0)}`;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("es-EC", { day: "2-digit", month: "short" });
}

export function toDateInput(value: string | Date = new Date()): string {
  const d = typeof value === "string" ? new Date(value) : value;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthName(month: number): string {
  return MESES[month] ?? "";
}

export function monthNameShort(month: number): string {
  return MESES_CORTOS[month] ?? "";
}

export function monthLabel(mes: number, anio: number): string {
  return `${MESES[mes]} ${anio}`;
}

export function parseMonthParam(
  value: string | string[] | undefined,
  fallback: Date = new Date(),
): { mes: number; anio: number } {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    if (m >= 1 && m <= 12) return { mes: m - 1, anio: y };
  }
  return { mes: fallback.getMonth(), anio: fallback.getFullYear() };
}

export function monthParam(mes: number, anio: number): string {
  return `${anio}-${String(mes + 1).padStart(2, "0")}`;
}

export function monthRange(mes: number, anio: number): { start: Date; end: Date } {
  return {
    start: new Date(anio, mes, 1, 0, 0, 0, 0),
    end: new Date(anio, mes + 1, 1, 0, 0, 0, 0),
  };
}

export function isInMonth(value: string | Date, mes: number, anio: number): boolean {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.getFullYear() === anio && d.getMonth() === mes;
}

export function previousMonth(mes: number, anio: number): { mes: number; anio: number } {
  return mes === 0 ? { mes: 11, anio: anio - 1 } : { mes: mes - 1, anio };
}

export function initials(nombres: string, apellidos?: string): string {
  return `${nombres.charAt(0)}${apellidos?.charAt(0) ?? ""}`.toUpperCase();
}

export function fullName(p: { nombres: string; apellidos: string }): string {
  return `${p.nombres} ${p.apellidos}`.trim();
}

export function percent(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function delta(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
}

export function csvEscape(value: string | number | null | undefined): string {
  const s = value === null || value === undefined ? "" : String(value);
  if (/[",;\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
