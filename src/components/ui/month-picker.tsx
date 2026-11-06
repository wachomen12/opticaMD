"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { MESES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function MonthPicker({
  mes,
  anio,
  className,
}: {
  mes: number;
  anio: number;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  function navigate(nextMes: number, nextAnio: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mes", `${nextAnio}-${String(nextMes + 1).padStart(2, "0")}`);
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const now = new Date();
  const isCurrent = mes === now.getMonth() && anio === now.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 4 + i);
  if (!years.includes(anio)) years.push(anio);

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-xs transition-opacity",
        pending && "opacity-60",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => {
          const d = new Date(anio, mes - 1, 1);
          navigate(d.getMonth(), d.getFullYear());
        }}
        aria-label="Mes anterior"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <CalendarDays className="ml-1 hidden h-3.5 w-3.5 text-primary/60 sm:block" />
      <select
        aria-label="Mes"
        value={mes}
        onChange={(event) => navigate(Number(event.target.value), anio)}
        className="h-8 cursor-pointer appearance-none rounded-lg border-0 bg-transparent pl-1.5 pr-0.5 text-[12.5px] font-semibold text-ink outline-none focus:ring-0"
      >
        {MESES.map((nombre, index) => (
          <option key={nombre} value={index}>
            {nombre}
          </option>
        ))}
      </select>
      <select
        aria-label="Año"
        value={anio}
        onChange={(event) => navigate(mes, Number(event.target.value))}
        className="h-8 cursor-pointer appearance-none rounded-lg border-0 bg-transparent px-1 text-[12.5px] font-semibold text-ink outline-none focus:ring-0"
      >
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => {
          const d = new Date(anio, mes + 1, 1);
          navigate(d.getMonth(), d.getFullYear());
        }}
        aria-label="Mes siguiente"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {!isCurrent && (
        <button
          type="button"
          onClick={() => navigate(now.getMonth(), now.getFullYear())}
          title="Volver al mes actual"
          className="ml-0.5 flex h-8 w-8 items-center justify-center rounded-lg text-primary/70 transition-colors hover:bg-primary-50 hover:text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
