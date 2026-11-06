"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

export function AppShell({
  children,
  demo,
  enTaller,
  pacientes,
  todayLabel,
}: {
  children: React.ReactNode;
  demo: boolean;
  enTaller: number;
  pacientes: number;
  todayLabel: string;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (window.localStorage.getItem("optica-sidebar-collapsed") === "1") {
      setCollapsed(true);
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      window.localStorage.setItem("optica-sidebar-collapsed", value ? "0" : "1");
      return !value;
    });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        demo={demo}
        enTaller={enTaller}
        pacientes={pacientes}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-200 ease-out",
          collapsed ? "lg:pl-[72px]" : "lg:pl-[248px]",
        )}
      >
        <Topbar
          onMenu={() => setMobileOpen(true)}
          demo={demo}
          enTaller={enTaller}
          todayLabel={todayLabel}
        />
        <main className="mx-auto w-full max-w-[1520px] flex-1 px-4 py-5 sm:px-6 lg:px-7 lg:py-6">
          {children}
        </main>
        <footer className="no-print mt-auto border-t border-slate-200/80 bg-white/60">
          <div className="mx-auto flex w-full max-w-[1520px] flex-col items-center justify-between gap-1 px-4 py-3 text-[11px] text-ink-subtle sm:flex-row sm:px-6 lg:px-7">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="font-semibold tracking-tight text-ink">ÓPTICA MD</span>
              <span className="text-slate-300">·</span>
              <span>Vemos por ti, cuidamos tu visión</span>
            </p>
            <p className="font-mono text-[10px] uppercase tracking-wider text-ink-subtle tabular-nums">
              ERP Clínico &amp; Contable · v1.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}