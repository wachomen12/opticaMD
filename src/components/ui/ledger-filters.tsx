"use client";

import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Select } from "@/components/ui/select";

export type FilterOption = { value: string; label: string };

export function LedgerFilters({
  basePath,
  q,
  categoria,
  mes,
  estado,
  categories,
  estadoOptions,
  placeholder = "Buscar…",
  categoriaLabel = "Todas las categorías",
  estadoLabel = "Todos los estados",
}: {
  basePath: string;
  q?: string;
  categoria?: string;
  mes?: string;
  estado?: string;
  categories: FilterOption[];
  estadoOptions?: FilterOption[];
  placeholder?: string;
  categoriaLabel?: string;
  estadoLabel?: string;
}) {
  const hasFilters =
    Boolean(q) || (categoria && categoria !== "TODAS") || (estado && estado !== "TODAS");

  const cleanHref = `${basePath}${mes ? `?mes=${mes}` : ""}`;

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      <form
        action={basePath}
        method="get"
        className="relative flex min-w-0 flex-1 items-center"
        role="search"
      >
        {mes && <input type="hidden" name="mes" value={mes} />}
        {categoria && categoria !== "TODAS" && (
          <input type="hidden" name="categoria" value={categoria} />
        )}
        {estado && estado !== "TODAS" && <input type="hidden" name="estado" value={estado} />}
        <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-slate-400" />
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={placeholder}
          aria-label={placeholder}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-20 text-[12.5px] text-ink shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-primary/40 focus:ring-2 focus:ring-primary/10"
        />
        <button
          type="submit"
          className="absolute right-1.5 h-7 rounded-lg bg-primary px-2.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary-700"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <div className="hidden items-center gap-1.5 text-[11px] font-medium text-ink-subtle sm:flex">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filtrar
        </div>
        <form action={basePath} method="get" className="min-w-0 flex-1 sm:w-[212px] sm:flex-none">
          {mes && <input type="hidden" name="mes" value={mes} />}
          {q && <input type="hidden" name="q" value={q} />}
          {estado && estado !== "TODAS" && <input type="hidden" name="estado" value={estado} />}
          <Select
            name="categoria"
            defaultValue={categoria ?? "TODAS"}
            aria-label="Filtrar por categoría"
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
            className="h-10 text-[12.5px]"
          >
            <option value="TODAS">{categoriaLabel}</option>
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <noscript>
            <button type="submit" className="mt-1 text-xs underline">
              Aplicar filtro
            </button>
          </noscript>
        </form>

        {estadoOptions && estadoOptions.length > 0 && (
          <form action={basePath} method="get" className="min-w-0 flex-1 sm:w-[160px] sm:flex-none">
            {mes && <input type="hidden" name="mes" value={mes} />}
            {q && <input type="hidden" name="q" value={q} />}
            {categoria && categoria !== "TODAS" && (
              <input type="hidden" name="categoria" value={categoria} />
            )}
            <Select
              name="estado"
              defaultValue={estado ?? "TODAS"}
              aria-label={estadoLabel}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className="h-10 text-[12.5px]"
            >
              <option value="TODAS">{estadoLabel}</option>
              {estadoOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </form>
        )}

        {hasFilters && (
          <Link
            href={cleanHref}
            className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-ink-muted transition-colors hover:border-slate-300 hover:text-ink"
            title="Limpiar filtros"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Limpiar</span>
          </Link>
        )}
      </div>
    </div>
  );
}
