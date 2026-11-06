"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  crearTokenSesion,
} from "@/lib/auth";
import { validarCredenciales } from "@/lib/usuarios";
import { getString } from "@/lib/form";
import type { ActionState } from "@/lib/types";

function mensajeErrorBaseDatos(error: unknown): string {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    const code = error.errorCode;
    if (
      code === "P1000" ||
      code === "P1001" ||
      code === "P1002" ||
      code === "P1003" ||
      code === "P1017"
    ) {
      return "No se pudo conectar con PostgreSQL. Revisa DATABASE_URL, que Neon esté activo y que la contraseña esté codificada en la URL.";
    }
    return "No se pudo inicializar la conexión con PostgreSQL. Revisa DATABASE_URL y DIRECT_URL.";
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021" || error.code === "P2022") {
      return "La base de datos no tiene el esquema actualizado. Ejecuta `npx prisma db push` y luego `npm run db:admin`.";
    }
  }

  return "No se pudo conectar con la base de datos. Intenta nuevamente.";
}

function destinoSeguro(next: string): string {
  if (!next.startsWith("/") || next.startsWith("//") || next.startsWith("/login")) {
    return "/dashboard";
  }
  return next;
}

export async function iniciarSesion(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    return { ok: false, message: "Ingresa tu correo y contraseña." };
  }

  if (!process.env.DATABASE_URL) {
    return {
      ok: false,
      message:
        "Falta configurar DATABASE_URL. En local revisa el archivo .env; en Vercel, las Environment Variables del proyecto.",
    };
  }

  let credencialesValidas = false;
  try {
    credencialesValidas = await validarCredenciales(email, password);
  } catch (error) {
    console.error("[iniciarSesion] Error al validar credenciales", {
      name: error instanceof Error ? error.name : "Error",
      code:
        (error as { code?: string }).code ??
        (error as { errorCode?: string }).errorCode,
      message: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, message: mensajeErrorBaseDatos(error) };
  }

  if (!credencialesValidas) {
    return { ok: false, message: "Correo o contraseña incorrectos." };
  }

  const token = await crearTokenSesion(email);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect(destinoSeguro(getString(formData, "next")));
}

export async function cerrarSesion(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
