"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { eliminarCompra, eliminarGasto } from "@/app/actions/contabilidad";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { money } from "@/lib/format";

type EgresoTipo = "COMPRA" | "GASTO";

const COPY: Record<
  EgresoTipo,
  { titulo: string; boton: string; aviso: string; descripcion: string }
> = {
  COMPRA: {
    titulo: "¿Seguro que quieres eliminar esta compra?",
    boton: "Sí, eliminar compra",
    aviso:
      "La compra dejará de contar como egreso en el reporte del mes. Esta acción no se puede deshacer.",
    descripcion:
      "Las compras son registros independientes de las ventas. Eliminar una venta no borra automáticamente las compras ni los gastos.",
  },
  GASTO: {
    titulo: "¿Seguro que quieres eliminar este gasto?",
    boton: "Sí, eliminar gasto",
    aviso:
      "El gasto dejará de contar como egreso en el reporte del mes. Esta acción no se puede deshacer.",
    descripcion:
      "Los gastos son registros independientes de las ventas. Eliminar una venta no borra automáticamente las compras ni los gastos.",
  },
};

export function EliminarEgresoButton({
  tipo,
  id,
  titulo,
  detalle,
  monto,
  meta,
}: {
  tipo: EgresoTipo;
  id: string;
  titulo: string;
  detalle?: string;
  monto: number;
  meta?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const copy = COPY[tipo];

  function handleEliminar() {
    setError(null);
    startTransition(async () => {
      const result = tipo === "COMPRA" ? await eliminarCompra(id) : await eliminarGasto(id);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message ?? "No se pudo eliminar el registro");
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) {
          setOpen(nextOpen);
          if (!nextOpen) setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          title={tipo === "COMPRA" ? "Eliminar compra" : "Eliminar gasto"}
          aria-label={tipo === "COMPRA" ? "Eliminar compra" : "Eliminar gasto"}
          className="h-8 w-8 rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.85} />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md overflow-hidden rounded-lg border-slate-300 p-0 shadow-lift">
        <DialogHeader className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 text-left">
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700">
            <span className="h-2 w-2 rounded-xs bg-red-500" />
            <span>Acción irreversible</span>
          </div>
          <DialogTitle className="font-display text-[16px] font-semibold tracking-tight text-ink">
            {copy.titulo}
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[12px] text-ink-muted">
            {copy.aviso}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-[12px] font-semibold text-ink">{titulo}</span>
              <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ink">
                {money(monto)}
              </span>
            </div>
            {detalle && <p className="truncate text-[12px] text-ink-muted">{detalle}</p>}
            {meta && <p className="text-[10.5px] text-ink-subtle">{meta}</p>}
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-red-200/80 bg-red-50/60 p-3 text-[11.5px] leading-relaxed text-red-950">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <p>{copy.descripcion}</p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
        </div>

        <DialogFooter className="border-t border-slate-200 bg-slate-50/60 px-5 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => setOpen(false)}
            className="h-8 rounded-md px-3 text-xs"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleEliminar}
            disabled={pending}
            className="h-8 gap-1.5 rounded-md px-3.5 text-xs font-semibold"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>{pending ? "Eliminando…" : copy.boton}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
