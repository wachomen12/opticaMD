import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL ?? "";
const isPlaceholder =
  databaseUrl.includes("xxxxx") ||
  databaseUrl.includes("password@db") ||
  databaseUrl.trim() === "";

/** true cuando hay una DATABASE_URL real de PostgreSQL configurada */
export const dbEnabled =
  !isPlaceholder && databaseUrl.startsWith("postgres") && process.env.DEMO_MODE !== "true";

if (dbEnabled) {
  process.env.DIRECT_URL = process.env.DIRECT_URL || databaseUrl;
}

export const prisma: PrismaClient | null = dbEnabled
  ? (globalForPrisma.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    }))
  : null;

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
