import { existsSync, readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";

/**
 * Comprueba la conexión con PostgreSQL, el esquema y el usuario administrador.
 * Uso: npm run db:check
 */

function cargarEnv(ruta = ".env"): boolean {
  if (!existsSync(ruta)) {
    console.error("✗ No se encontró el archivo .env en la raíz del proyecto.");
    return false;
  }

  for (const linea of readFileSync(ruta, "utf8").split(/\r?\n/)) {
    const match = linea.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    let valor = match[2].trim();
    if (
      (valor.startsWith('"') && valor.endsWith('"')) ||
      (valor.startsWith("'") && valor.endsWith("'"))
    ) {
      valor = valor.slice(1, -1);
    }
    if (!(match[1] in process.env)) process.env[match[1]] = valor;
  }

  return true;
}

function hostDe(url: string | undefined): string {
  if (!url) return "(sin definir)";
  try {
    const parsed = new URL(url);
    return `${parsed.hostname}:${parsed.port || "5432"}`;
  } catch {
    return "(URL inválida)";
  }
}

async function main(): Promise<void> {
  if (!cargarEnv()) {
    process.exitCode = 1;
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("✗ DATABASE_URL no está definida en .env.");
    process.exitCode = 1;
    return;
  }

  console.log(`→ Conectando a ${hostDe(process.env.DATABASE_URL)}…`);
  if (process.env.DIRECT_URL) {
    console.log(`→ DIRECT_URL (migraciones): ${hostDe(process.env.DIRECT_URL)}`);
  }

  const prisma = new PrismaClient({ log: ["error"] });

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Conexión a PostgreSQL correcta.");

    const tablas = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    const nombres = tablas.map((t) => t.table_name);
    console.log(`✓ Tablas encontradas (${nombres.length}): ${nombres.join(", ") || "ninguna"}`);

    if (!nombres.includes("usuarios")) {
      console.error("✗ Falta la tabla `usuarios`. Ejecuta: npx prisma db push");
      process.exitCode = 1;
      return;
    }

    const [conteo] = await prisma.$queryRaw<Array<{ total: bigint }>>`
      SELECT COUNT(*) AS total FROM "usuarios"
    `;
    const total = Number(conteo?.total ?? 0);
    console.log(`✓ Usuarios registrados: ${total}`);

    if (total === 0) {
      console.error("✗ No hay usuarios. Ejecuta: npm run db:admin");
      process.exitCode = 1;
      return;
    }

    const admins = await prisma.$queryRaw<Array<{ email: string; activo: boolean }>>`
      SELECT email, activo FROM "usuarios" ORDER BY email
    `;
    for (const admin of admins) {
      console.log(`  · ${admin.email}${admin.activo ? "" : " (inactivo)"}`);
    }
  } catch (error) {
    const detalle = error as {
      name?: string;
      code?: string;
      errorCode?: string;
      message?: string;
    };
    const codigo = detalle.code ?? detalle.errorCode;
    console.error("✗ Error de conexión o de esquema:");
    console.error(
      `  ${detalle.name ?? "Error"}${codigo ? ` (${codigo})` : ""}: ${detalle.message ?? String(error)}`,
    );
    console.error(
      "  Revisa DATABASE_URL, que Neon esté activo, el SSL (?sslmode=require) y que la contraseña esté codificada en la URL.",
    );
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
