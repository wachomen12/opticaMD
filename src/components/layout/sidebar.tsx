"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Receipt,
  PackageOpen,
  Wallet,
  FileSpreadsheet,
  ChevronsLeft,
  ChevronsRight,
  X,
  Database,
  FlaskConical,
  LogOut,
} from "lucide-react";
import { cerrarSesion } from "@/app/actions/auth";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { LogoOpticaMD } from "@/components/brand/logo-optica-md";

const ICONS = {
  LayoutDashboard,
  Users,
  Receipt,
  PackageOpen,
  Wallet,
  FileSpreadsheet,
} as const;

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onClose: () => void;
  demo: boolean;
  enTaller: number;
  pacientes: number;
};

function NavContent({
  collapsed,
  demo,
  enTaller,
  pacientes,
  onNavigate,
}: {
  collapsed: boolean;
  demo: boolean;
  enTaller: number;
  pacientes: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  const badges: Record<string, number> = {
    "/ventas": enTaller,
    "/pacientes": pacientes,
  };

  return (
    <>
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2.5 py-4 scrollbar-slim">
        {NAV_ITEMS.map((group) => (
          <div key={group.group} className="mb-5 last:mb-0">
            {!collapsed ? (
              <p className="px-2.5 pb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
                {group.group}
              </p>
            ) : (
              <div className="mx-auto mb-2.5 h-px w-6 bg-white/10" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = ICONS[item.icon as keyof typeof ICONS];
                const active =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
                const badge = badges[item.href] ?? 0;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-2.5 rounded-md py-2 text-[13px] font-medium transition-colors duration-100",
                        collapsed ? "justify-center px-0" : "px-2.5",
                        active
                          ? "bg-primary-600/35 text-white ring-1 ring-inset ring-white/15"
                          : "text-slate-300/75 hover:bg-white/[0.06] hover:text-white",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-accent" />
                      )}
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-accent-300" : "text-slate-300/60 group-hover:text-white",
                        )}
                        strokeWidth={active ? 2 : 1.75}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && badge > 0 && (
                        <span
                          className={cn(
                            "ml-auto rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tabular-nums",
                            active
                              ? "bg-accent text-white"
                              : "bg-white/10 text-slate-200",
                          )}
                        >
                          {badge > 99 ? "99+" : badge}
                        </span>
                      )}
                      {collapsed && badge > 0 && (
                        <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Pie técnico de estado y sesión */}
      <div className="mt-auto space-y-2 border-t border-white/10 bg-secondary-950/40 p-2.5">
        {!collapsed ? (
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-2">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded",
                demo
                  ? "bg-accent/20 text-accent-300"
                  : "bg-emerald-500/20 text-emerald-300",
              )}
            >
              {demo ? (
                <FlaskConical className="h-3.5 w-3.5" />
              ) : (
                <Database className="h-3.5 w-3.5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-medium text-white/90">
                {demo ? "Entorno Demo" : "Base de Datos Activa"}
              </p>
              <p className="truncate font-mono text-[9.5px] text-white/45">
                {demo ? "Datos locales de prueba" : "PostgreSQL · Sincronizado"}
              </p>
            </div>
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                demo ? "bg-accent" : "bg-emerald-400",
              )}
            />
          </div>
        ) : (
          <div
            className="flex justify-center py-1"
            title={demo ? "Entorno Demo" : "Base de Datos Activa"}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                demo ? "bg-accent" : "bg-emerald-400",
              )}
            />
          </div>
        )}

        <div
          className={cn(
            "flex items-center justify-between gap-2 rounded-md px-1.5 py-1",
            collapsed && "flex-col justify-center px-0",
          )}
        >
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary-700 font-mono text-[10px] font-bold text-white ring-1 ring-white/15">
              MD
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-semibold text-white/90">
                  ÓPTICA MD
                </p>
                <p className="truncate text-[10px] text-white/45">
                  Dirección Clínica
                </p>
              </div>
            )}
          </div>

          <form action={cerrarSesion}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex h-7 w-7 items-center justify-center rounded text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onClose,
  demo,
  enTaller,
  pacientes,
}: SidebarProps) {
  const router = useRouter();
  const prefetched = useRef(false);

  useEffect(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    for (const group of NAV_ITEMS) {
      for (const item of group.items) router.prefetch(item.href);
    }
  }, [router]);

  return (
    <>
      {/* Sidebar escritorio */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col overflow-hidden border-r border-secondary-950 bg-secondary text-white transition-[width] duration-200 ease-out lg:flex",
          collapsed ? "w-[72px]" : "w-[248px]",
        )}
      >
        <div className="relative flex h-full flex-col">
          <div
            className={cn(
              "relative flex h-16 shrink-0 items-center border-b border-white/10 bg-secondary-950/30",
              collapsed ? "justify-center px-1.5" : "justify-between px-3.5",
            )}
          >
            <LogoOpticaMD collapsed={collapsed} />
            {!collapsed && (
              <button
                type="button"
                onClick={onToggle}
                aria-label="Colapsar menú"
                title="Colapsar menú"
                className="rounded p-1 text-white/45 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            )}
          </div>

          <NavContent
            collapsed={collapsed}
            demo={demo}
            enTaller={enTaller}
            pacientes={pacientes}
          />

          {collapsed && (
            <div className="border-t border-white/10 bg-secondary-950/40 p-2">
              <button
                type="button"
                onClick={onToggle}
                aria-label="Expandir menú"
                title="Expandir menú"
                className="flex w-full items-center justify-center rounded py-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Drawer móvil */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          onClick={onClose}
          className={cn(
            "absolute inset-0 bg-secondary-950/60 backdrop-blur-[1px] transition-opacity duration-200",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 flex w-[256px] flex-col overflow-hidden border-r border-white/10 bg-secondary text-white shadow-xl transition-transform duration-200 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
          aria-label="Menú principal"
        >
          <div className="relative flex h-full flex-col">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-secondary-950/30 px-3.5">
              <LogoOpticaMD />
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar menú"
                className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <NavContent
              collapsed={false}
              demo={demo}
              enTaller={enTaller}
              pacientes={pacientes}
              onNavigate={onClose}
            />
          </div>
        </aside>
      </div>
    </>
  );
}
