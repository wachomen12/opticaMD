// ─────────────────────────────────────────────────────────────
//  Sesión firmada — ÓPTICA MD
//  Funciona tanto en el runtime de Node (Server Actions) como en
//  el Edge Runtime (middleware). Solo usa Web Crypto.
// ─────────────────────────────────────────────────────────────

export const SESSION_COOKIE = "optica_session";
/** Duración de la sesión: 12 horas. */
export const SESSION_MAX_AGE = 60 * 60 * 12;

export type Sesion = {
  email: string;
  exp: number;
};

function sessionSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      "AUTH_SECRET no está configurada. Define una cadena aleatoria de al menos 32 caracteres.",
    );
  }
  return secret;
}

/** Comparación de strings en tiempo constante (evita filtraciones por timing). */
function igualesEnTiempoConstante(a: string, b: string): boolean {
  const length = Math.max(a.length, b.length, 1);
  let diff = a.length ^ b.length;
  for (let i = 0; i < length; i++) {
    diff |= (a.charCodeAt(i % Math.max(a.length, 1)) || 0) ^
      (b.charCodeAt(i % Math.max(b.length, 1)) || 0);
  }
  return diff === 0;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function firmar(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(data),
  );
  return base64UrlEncode(new Uint8Array(signature));
}

export async function crearTokenSesion(email: string): Promise<string> {
  const payload: Sesion = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const data = base64UrlEncode(
    new TextEncoder().encode(JSON.stringify(payload)),
  );
  const signature = await firmar(data);
  return `${data}.${signature}`;
}

export async function verificarTokenSesion(
  token: string | undefined | null,
): Promise<Sesion | null> {
  if (!token) return null;
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;

  try {
    const expected = await firmar(data);
    if (!igualesEnTiempoConstante(signature, expected)) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64UrlDecode(data)),
    ) as Partial<Sesion>;

    if (
      typeof payload.email !== "string" ||
      typeof payload.exp !== "number" ||
      payload.exp <= Date.now()
    ) {
      return null;
    }

    return { email: payload.email, exp: payload.exp };
  } catch {
    return null;
  }
}
