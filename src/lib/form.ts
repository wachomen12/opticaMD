export function getString(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export function getOptional(formData: FormData, key: string): string | null {
  const value = getString(formData, key);
  return value === "" ? null : value;
}

export function getNumber(formData: FormData, key: string): number {
  const raw = getString(formData, key);
  if (!raw) return 0;
  let normalized = raw;
  if (raw.includes(",") && raw.includes(".")) {
    normalized = raw.replace(/\./g, "").replace(",", ".");
  } else if (raw.includes(",")) {
    normalized = raw.replace(",", ".");
  }
  const value = Number(normalized.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(value) ? value : 0;
}

export function getBoolean(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

/** Convierte "2026-11-04" en fecha local a mediodía (evita desfases UTC). */
export function parseDateInput(value: string, fallback = new Date()): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return fallback;
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(y, m - 1, d, 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

export function requireFields(
  fields: Record<string, string | number | null | undefined>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value === null || value === undefined || value === "" || value === 0) {
      errors[key] = "Este campo es obligatorio";
    }
  }
  return errors;
}
