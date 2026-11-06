import { prisma } from "./prisma";
import { verifyPassword } from "./password";

/**
 * Valida las credenciales contra la tabla `usuarios` de PostgreSQL.
 * Solo se permite el acceso a usuarios activos.
 */
export async function validarCredenciales(
  email: string,
  password: string,
): Promise<boolean> {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!usuario || !usuario.activo) return false;

  return verifyPassword(password, usuario.passwordHash);
}
