"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Eye, EyeOff, KeyRound, Mail, ShieldCheck, Terminal } from "lucide-react";
import { iniciarSesion } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

export function LoginForm({
  next,
  credencialesDemo,
}: {
  next: string;
  credencialesDemo?: { email: string; password: string };
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    iniciarSesion,
    initialState,
  );
  const [verPassword, setVerPassword] = useState(false);
  const [email, setEmail] = useState(credencialesDemo?.email ?? "");
  const [password, setPassword] = useState(credencialesDemo?.password ?? "");

  function cargarCredencialesDemo() {
    if (!credencialesDemo) return;
    setEmail(credencialesDemo.email);
    setPassword(credencialesDemo.password);
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state.message && !state.ok && (
        <Alert variant="error" title="Error de autenticación">
          {state.message}
        </Alert>
      )}

      <Field label="Correo corporativo" htmlFor="email" required>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-0 flex h-full w-9 items-center justify-center border-r border-slate-200/80 text-slate-400">
            <Mail className="h-3.5 w-3.5" strokeWidth={1.85} />
          </div>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@opticamd.ec"
            className="pl-11 font-mono text-[12.5px]"
          />
        </div>
      </Field>

      <Field label="Clave de acceso" htmlFor="password" required>
        <div className="relative flex items-center">
          <div className="pointer-events-none absolute left-0 flex h-full w-9 items-center justify-center border-r border-slate-200/80 text-slate-400">
            <KeyRound className="h-3.5 w-3.5" strokeWidth={1.85} />
          </div>
          <Input
            id="password"
            name="password"
            type={verPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="pl-11 pr-10 font-mono text-[12.5px]"
          />
          <button
            type="button"
            onClick={() => setVerPassword((value) => !value)}
            aria-label={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            title={verPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
          >
            {verPassword ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </Field>

      <div className="pt-1">
        <SubmitButton
          variant="accent"
          size="lg"
          pendingLabel="Verificando credenciales…"
          className="h-10 w-full gap-2 rounded-md text-[13px] font-semibold tracking-tight shadow-xs"
        >
          <span>Acceder al Sistema</span>
          <ArrowRight className="h-4 w-4" />
        </SubmitButton>
      </div>

      {credencialesDemo && (
        <div className="rounded-md border border-slate-200 bg-slate-50/90 p-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                Credenciales Entorno Demo
              </span>
            </div>
            <button
              type="button"
              onClick={cargarCredencialesDemo}
              className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[9.5px] font-semibold text-ink-muted transition-colors hover:border-primary hover:text-primary"
            >
              Rellenar
            </button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="truncate rounded border border-slate-200/70 bg-white px-2 py-1 text-ink">
              <span className="block text-[8.5px] uppercase text-ink-subtle">Usuario</span>
              {credencialesDemo.email}
            </div>
            <div className="truncate rounded border border-slate-200/70 bg-white px-2 py-1 text-ink">
              <span className="block text-[8.5px] uppercase text-ink-subtle">Clave</span>
              {credencialesDemo.password}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 pt-3 text-center font-mono text-[10px] text-ink-subtle">
        <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" />
        <span>SESIÓN FIRMADA HMAC-SHA256 · EXPIRACIÓN 12H</span>
      </div>
    </form>
  );
}