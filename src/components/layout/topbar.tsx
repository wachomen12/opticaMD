"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ChevronRight,
  Glasses,
  Menu,
  Search,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TITLES: Array<{ match: RegExp; section: string; title: string }> = [
  { match: /^\/dashboard/, section: "Control Ejecutivo", title: "Balance y Flujo Mensual" },
  { match: /^\/pacientes\/[^/]+\/historial/, section: "Consultorio Optométrico", title: "Historia Clínica y RX" },
  { match: /^\/pacientes\/[^/]+/, section: "Expediente Clínico", title: "Ficha del Paciente" },
  { match: /^\/pacientes/, section: "Área Clínica", title: "Padrón de Pacientes" },
  { match: /^\/ventas/, section: "Contabilidad", title: "Ventas, Abonos y Taller" },
  { match: /^\/compras/, section: "Contabilidad", title: "Compras a Proveedores" },
  { match: /^\/gastos/, section: "Contabilidad", title: "Gastos Operativos" },
  { match: /^\/reportes/, section: "Contabilidad", title: "Estado de Resultados Mensual" },
];

export function Topbar({
  onMenu,
  demo,
  enTaller,
  todayLabel,
}: {
  onMenu: () => void;
  demo: boolean;
  enTaller: number;
  todayLabel: string;
}) {
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement>(null);
  const meta = TITLES.find((t) => t.match.test(pathname)) ?? {
    section: "ÓPTICA MD",
    title: "Gestión Clínica y Contable",
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-[1520px] items-center gap-3 px-4 sm:px-6 lg:px-7">
        <button
          type="button"
          onClick={onMenu}
          className="rounded-md border border-slate-200 p-1.5 text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-4 w-4" />
        </button>

        {/* Breadcrumb técnico + Título de vista */}
        <div className="min-w-0">
          <div className="flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
            <span className="hidden sm:inline">ÓPTICA MD</span>
            <ChevronRight className="hidden h-3 w-3 text-slate-300 sm:inline" />
            <span className="truncate text-primary">{meta.section}</span>
          </div>
          <h1 className="truncate font-display text-[14.5px] font-semibold leading-tight text-ink">
            {meta.title}
          </h1>
        </div>

        {/* Herramientas operativas derechas */}
        <div className="ml-auto flex items-center gap-2">
          <form
            action="/pacientes"
            method="get"
            className="relative hidden w-[230px] items-center md:flex xl:w-[270px]"
            role="search"
          >
            <Search className="pointer-events-none absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              ref={inputRef}
              type="search"
              name="q"
              placeholder="Buscar paciente o cédula…"
              className="h-8 w-full rounded-md border border-slate-200 bg-slate-50/70 pl-8 pr-14 text-[12px] text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
            />
            <kbd className="pointer-events-none absolute right-2 hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[9px] font-medium text-slate-400 lg:block">
              Ctrl+K
            </kbd>
          </form>

          {/* Indicador directo de trabajos en taller óptico */}
          <Link
            href="/ventas?entrega=EN_TALLER"
            title="Ver órdenes de lentes en taller"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11.5px] font-medium transition-colors",
              enTaller > 0
                ? "border-accent-200 bg-accent-50/70 text-accent-800 hover:bg-accent-100/70"
                : "border-slate-200 bg-white text-ink-muted hover:bg-slate-50",
            )}
          >
            <Glasses className="h-3.5 w-3.5 shrink-0 text-accent-600" />
            <span className="hidden sm:inline">En taller:</span>
            <span className="font-mono font-bold tabular-nums">{enTaller}</span>
          </Link>

          {/* Acceso rápido a consulta / pacientes */}
          <Link
            href="/pacientes"
            title="Ir a Pacientes e Historial Clínico"
            className="hidden h-8 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[11.5px] font-medium text-white shadow-xs transition-colors hover:bg-primary-700 sm:inline-flex"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Pacientes / HC</span>
          </Link>

          {/* Fecha del sistema */}
          <div className="hidden items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50/60 px-2.5 py-1 xl:flex">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-[11px] font-medium capitalize text-ink-muted">
              {todayLabel}
            </span>
          </div>

          {demo && (
            <span className="hidden items-center gap-1.5 rounded border border-amber-300/80 bg-amber-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-amber-800 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Demo
            </span>
          )}
        </div>
      </div>
    </header>
  );
}