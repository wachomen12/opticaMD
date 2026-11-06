import { money } from "./format";

/** Normaliza teléfonos de Ecuador para enlaces wa.me (593…). */
export function normalizarTelefonoWhatsApp(telefono: string): string | null {
  const digits = telefono.replace(/\D/g, "");
  if (!digits) return null;

  if (digits.startsWith("593")) return digits;
  if (digits.length === 10 && digits.startsWith("0")) return `593${digits.slice(1)}`;
  if (digits.length === 9 && /^[29]/.test(digits)) return `593${digits}`;
  return digits;
}

export function mensajeComprobantePedido({
  nombre,
  descripcion,
  total,
  abono,
  saldo,
}: {
  nombre: string;
  descripcion: string;
  total: number;
  abono: number;
  saldo: number;
}): string {
  return `Hola ${nombre}, gracias por confiar en ÓPTICA MD. Registramos su pedido (${descripcion}). Total: ${money(total)} | Abono: ${money(abono)} | Saldo pendiente: ${money(saldo)}. Le avisaremos apenas esté listo.`;
}

export function mensajeLentesListos({
  nombre,
  saldo,
}: {
  nombre: string;
  saldo: number;
}): string {
  return `Hola ${nombre}, le saludamos de ÓPTICA MD 👓. Sus lentes ya están listos para retirar. Saldo pendiente al retirar: ${money(saldo)}. ¡Le esperamos!`;
}

export function enlaceWhatsApp(
  telefono: string,
  mensaje: string,
): string | null {
  const numero = normalizarTelefonoWhatsApp(telefono);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
