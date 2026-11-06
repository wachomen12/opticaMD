"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Archive, Loader2, Trash2, TriangleAlert } from "lucide-react";
import {
  eliminarPaciente,
  eliminarPacienteDefinitivo,
  resumenEliminacionPaciente,
} from "@/app/actions/pacientes";
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

type Resumen = { ventas: number; historias: number };

export function EliminarPacienteButton({
  id,
  nombre,
  activo = true,
  trigger,
}: {
  id: string;
  nombre: string;
  activo?: boolean;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    let vigente = true;
    setResumen(null);
    resumenEliminacionPaciente(id)
      .then((data) => {
        if (vigente) setResumen(data);
      })
      .catch(() => {
        if (vigente) setResumen({ ventas: 0, historias: 0 });
      });
    return () => {
      vigente = false;
    };
  }, [open, id]);

  function cerrarYLimpiar() {
    setResumen(null);
    setError(null);
  }

  function salirDeLaFicha() {
    if (pathname.startsWith(`/pacientes/${id}`)) {
      router.push("/pacientes");
    } else {
      router.refresh();
    }
  }

  function handleEliminar() {
    setError(null);
    startTransition(async () => {
      const result = await eliminarPacienteDefinitivo(id);
      if (result.ok) {
        setOpen(false);
        cerrarYLimpiar();
        salirDeLaFicha();
      } else {
        setError(result.message ?? "No se pudo eliminar el paciente");
      }
    });
  }

  function handleArchivar() {
    setError(null);
    startTransition(async () => {
      const result = await eliminarPaciente(id);
      if (result.ok) {
        setOpen(false);
        cerrarYLimpiar();
        salirDeLaFicha();
      } else {
        setError(result.message ?? "No se pudo archivar el expediente del paciente");
      }
    });
  }

  const tieneRegistros = !!resumen && (resumen.ventas > 0 || resumen.historias > 0);

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) {
          setOpen(nextOpen);
          if (!nextOpen) cerrarYLimpiar();
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="ghost"
            size="icon-sm"
            title="Eliminar paciente"
            className="h-8 w-8 rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.85} />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md overflow-hidden rounded-lg border-slate-300 p-0 shadow-lift">
        {/* Cabecera de advertencia */}
        <DialogHeader className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 text-left">
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-red-700">
            <span className="h-2 w-2 rounded-xs bg-red-500" />
            <span>Acción irreversible</span>
          </div>
          <DialogTitle className="font-display text-[16px] font-semibold tracking-tight text-ink">
            ¿Seguro que quieres eliminar este paciente?
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[12px] text-ink-muted">
            Esta acción no se puede deshacer. La ficha se borrará de la base de datos.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-5 py-4">
          <div className="rounded-md border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
            <span className="block font-mono text-[9.5px] font-semibold uppercase tracking-wider text-ink-subtle">
              Paciente seleccionado
            </span>
            <p className="mt-0.5 truncate text-[13.5px] font-semibold text-ink">{nombre}</p>
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-red-200/80 bg-red-50/60 p-3 text-[11.5px] leading-relaxed text-red-950">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div className="space-y-1">
              <p>
                <strong>Se eliminarán sus datos personales</strong> y sus historias clínicas
                asociadas.
              </p>
              <p>
                Si el paciente tiene ventas registradas, estas se conservarán en la
                contabilidad con su nombre para no alterar los reportes.
              </p>
            </div>
          </div>

          {resumen ? (
            <div className="flex items-center justify-between rounded-md border border-slate-200 px-3.5 py-2 text-[11px] text-ink-muted">
              <span>
                Historias clínicas:{" "}
                <strong className="tabular-nums text-ink">{resumen.historias}</strong>
              </span>
              <span>
                Ventas:{" "}
                <strong className="tabular-nums text-ink">{resumen.ventas}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-md border border-slate-200 px-3.5 py-2 text-[11px] text-ink-subtle">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Revisando registros asociados…
            </div>
          )}

          {tieneRegistros && (
            <p className="text-[11px] leading-relaxed text-ink-subtle">
              Si prefieres conservar el historial clínico, usa{" "}
              <strong className="font-semibold text-ink">Archivar</strong> en lugar de
              eliminar.
            </p>
          )}

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
          {activo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleArchivar}
              disabled={pending}
              className="h-8 gap-1.5 rounded-md px-3 text-xs"
            >
              {pending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Archive className="h-3.5 w-3.5" />
              )}
              <span>Archivar</span>
            </Button>
          )}
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
