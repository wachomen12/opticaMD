"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, TriangleAlert } from "lucide-react";
import { eliminarVenta } from "@/app/actions/contabilidad";
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

export function EliminarVentaButton({
  ventaId,
  codigo,
  descripcion,
  total,
  pagado,
  trigger,
}: {
  ventaId: string;
  codigo: string;
  descripcion?: string;
  total?: number;
  pagado?: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleEliminar() {
    setError(null);
    startTransition(async () => {
      const result = await eliminarVenta(ventaId);
      if (result.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message ?? "No se pudo eliminar la venta");
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
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Eliminar venta"
            aria-label="Eliminar venta"
            className="h-8 w-8 rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.85} />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md overflow-hidden rounded-lg border-slate-300 p-0 shadow-lift">
        <DialogHeader className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 text-left">
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700">
            <span className="h-2 w-2 rounded-xs bg-red-500" />
            <span>Acción irreversible</span>
          </div>
          <DialogTitle className="font-display text-[16px] font-semibold tracking-tight text-ink">
            ¿Seguro que quieres eliminar esta venta?
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[12px] text-ink-muted">
            Esta acción no se puede deshacer. La venta y sus pagos se borrarán del sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] font-semibold text-primary">{codigo}</span>
              {typeof total === "number" && (
                <span className="text-[13px] font-semibold tabular-nums text-ink">
                  {money(total)}
                </span>
              )}
            </div>
            <p className="truncate text-[12px] text-ink-muted">
              {descripcion ?? "Sin detalle"}
            </p>
            {typeof pagado === "number" && pagado > 0 && (
              <p className="text-[10.5px] tabular-nums text-ink-subtle">
                Abonado: {money(pagado)}
                {typeof total === "number" ? ` · Saldo: ${money(Math.max(0, total - pagado))}` : ""}
              </p>
            )}
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-red-200/80 bg-red-50/60 p-3 text-[11.5px] leading-relaxed text-red-950">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="space-y-1">
              <p>
                <strong>Se eliminarán los pagos registrados</strong> de esta venta y dejará de
                aparecer en los reportes de ingresos.
              </p>
              <p>
                Si tiene una historia clínica vinculada, la historia se conserva pero pierde el
                vínculo con el comprobante.
              </p>
            </div>
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
            <span>{pending ? "Eliminando…" : "Sí, eliminar"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
