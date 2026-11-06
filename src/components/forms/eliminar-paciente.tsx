"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, Loader2, ShieldAlert } from "lucide-react";
import { eliminarPaciente } from "@/app/actions/pacientes";
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

export function EliminarPacienteButton({
  id,
  nombre,
  trigger,
}: {
  id: string;
  nombre: string;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleArchive() {
    setError(null);
    startTransition(async () => {
      const result = await eliminarPaciente(id);
      if (result.ok) {
        setOpen(false);
        router.push("/pacientes");
        router.refresh();
      } else {
        setError(result.message ?? "No se pudo archivar el expediente del paciente");
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
            title="Archivar expediente"
            className="h-8 w-8 rounded-md text-slate-400 transition-colors hover:bg-amber-50 hover:text-amber-700"
          >
            <Archive className="h-3.5 w-3.5" strokeWidth={1.85} />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md overflow-hidden rounded-lg border-slate-300 p-0 shadow-lift">
        {/* Cabecera técnica de auditoría */}
        <DialogHeader className="border-b border-slate-200 bg-slate-50/80 px-5 py-4 text-left">
          <div className="mb-1 flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700">
            <span className="h-2 w-2 rounded-xs bg-amber-500" />
            <span>Control de Padrón Clínico</span>
          </div>
          <DialogTitle className="font-display text-[16px] font-semibold tracking-tight text-ink">
            ¿Archivar expediente clínico?
          </DialogTitle>
          <DialogDescription className="mt-0.5 text-[12px] text-ink-muted">
            El paciente pasará a estado inactivo sin afectar los cierres contables.
          </DialogDescription>
        </DialogHeader>

        {/* Cuerpo del modal con tarjeta de trazabilidad */}
        <div className="space-y-3 px-5 py-4">
          <div className="rounded-md border border-slate-200 bg-slate-50/50 px-3.5 py-2.5">
            <span className="block font-mono text-[9.5px] font-semibold uppercase tracking-wider text-ink-subtle">
              Paciente seleccionado
            </span>
            <p className="mt-0.5 truncate text-[13.5px] font-semibold text-ink">
              {nombre}
            </p>
          </div>

          <div className="flex items-start gap-2.5 rounded-md border border-amber-200/80 bg-amber-50/60 p-3 text-[11.5px] leading-relaxed text-amber-950">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p>
              <strong>Trazabilidad garantizada:</strong> Sus historias clínicas, recetas
              optométricas y ventas registradas se conservarán intactas para los reportes
              financieros mensuales.
            </p>
          </div>

          {error && <Alert variant="error">{error}</Alert>}
        </div>

        {/* Pie de acciones */}
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
            onClick={handleArchive}
            disabled={pending}
            className="h-8 gap-1.5 rounded-md bg-amber-600 px-3.5 text-xs font-semibold text-white hover:bg-amber-700"
          >
            {pending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
            <span>{pending ? "Archivando…" : "Confirmar archivo"}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}