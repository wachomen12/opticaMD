"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  crearTokenSesion,
  validarCredenciales,
} from "@/lib/auth";
import { getString } from "@/lib/form";
import type { ActionState } from "@/lib/types";

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

  if (!validarCredenciales(email, password)) {
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
