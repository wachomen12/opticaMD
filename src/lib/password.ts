import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;

/** Genera un hash scrypt con sal aleatoria para almacenar en la base de datos. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt, KEY_LENGTH);
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

/** Verifica una contraseña contra el hash almacenado. */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [algoritmo, salt, hashHex] = storedHash.split(":");
  if (algoritmo !== "scrypt" || !salt || !hashHex) return false;

  try {
    const hashAlmacenado = Buffer.from(hashHex, "hex");
    const hashCalculado = await scrypt(password, salt, hashAlmacenado.length);
    return (
      hashCalculado.length === hashAlmacenado.length &&
      timingSafeEqual(hashCalculado, hashAlmacenado)
    );
  } catch {
    return false;
  }
}
