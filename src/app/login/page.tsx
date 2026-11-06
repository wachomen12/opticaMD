import type { Metadata } from "next";
import {
  ClipboardCheck,
  HeartPulse,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";
import { LogoOpticaMD } from "@/components/brand/logo-optica-md";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  robots: { index: false, follow: false },
};

const BENEFICIOS = [
  {
    icon: HeartPulse,
    title: "Historias clínicas privadas",
    description: "Controles optométricos, recetas y evolución de cada paciente.",
  },
  {
    icon: ReceiptText,
    title: "Contabilidad al día",
    description: "Ventas, abonos, compras, gastos y reportes mensuales.",
  },
  {
    icon: ClipboardCheck,
    title: "Órdenes y comprobantes",
    description: "Recibos, órdenes de laboratorio y avisos por WhatsApp.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next ?? "/dashboard";

  return (
    <main className="relative min-h-screen overflow-hidden bg-secondary text-white">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-secondary-950 via-secondary to-primary-900" />
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[420px] w-[420px] rounded-full bg-primary/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-[380px] w-[380px] rounded-full bg-accent/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <section className="hidden flex-col justify-center lg:flex">
          <LogoOpticaMD tone="light" />

          <div className="mt-10 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70">
            <ShieldCheck className="h-3.5 w-3.5 text-accent-300" />
            Portal privado
          </div>

          <h1 className="mt-5 max-w-lg font-display text-[38px] font-bold leading-[1.08] tracking-tight text-white">
            Tu clínica y tu contabilidad,{" "}
            <span className="text-accent-300">protegidas</span> en un solo lugar.
          </h1>
          <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-white/60">
            Accede al historial clínico optométrico, las ventas y los reportes de
            ÓPTICA MD desde cualquier dispositivo.
          </p>

          <ul className="mt-9 space-y-4">
            {BENEFICIOS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-accent-300">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[12.5px] font-semibold text-white/90">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-white/45">
                      {item.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-10 flex items-center gap-2 text-[10px] text-white/35">
            <Sparkles className="h-3.5 w-3.5 text-accent/70" />
            Vemos por ti, cuidamos tu visión.
          </p>
        </section>

        <section className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="rounded-3xl border border-white/15 bg-white p-6 text-ink shadow-2xl shadow-secondary-950/40 sm:p-8">
            <div className="mb-6 lg:hidden">
              <LogoOpticaMD tone="dark" />
            </div>

            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary">
              ÓPTICA MD · Acceso al sistema
            </p>
            <h2 className="mt-1.5 font-display text-[24px] font-bold tracking-tight text-ink">
              Iniciar sesión
            </h2>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">
              Ingresa con las credenciales del personal autorizado.
            </p>

            <div className="mt-6">
              <LoginForm next={next} />
            </div>
          </div>

          <p className="mt-4 text-center text-[10px] text-white/35">
            © {new Date().getFullYear()} ÓPTICA MD · Sistema de gestión clínica y contable
          </p>
        </section>
      </div>
    </main>
  );
}
