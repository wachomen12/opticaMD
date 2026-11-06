"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { crearGasto } from "@/app/actions/contabilidad";
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
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { CATEGORIA_GASTO_OPTIONS } from "@/lib/constants";
import { toDateInput } from "@/lib/format";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

function GastoForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(crearGasto, initialState);

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction}>
      <div className="space-y-4 px-6 pb-5">
        {state.message && !state.ok && (
          <Alert variant="error" title="No se pudo registrar">
            {state.message}
          </Alert>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Fecha del gasto" htmlFor="fecha" required>
            <Input id="fecha" type="date" name="fecha" defaultValue={toDateInput()} required />
          </Field>
          <Field label="Categoría" htmlFor="categoria" required error={state.errors?.categoria}>
            <Select id="categoria" name="categoria" defaultValue="SERVICIOS">
              {CATEGORIA_GASTO_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Descripción del gasto"
          htmlFor="descripcion"
          required
          error={state.errors?.descripcion}
        >
          <Input
            id="descripcion"
            name="descripcion"
            placeholder="Ej. Planilla de luz del local"
            autoComplete="off"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Monto ($)" htmlFor="monto" required error={state.errors?.monto}>
            <Input
              id="monto"
              name="monto"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              required
            />
          </Field>
          <Field label="N° comprobante" htmlFor="comprobante" hint="Opcional">
            <Input id="comprobante" name="comprobante" placeholder="FAC-0001" autoComplete="off" />
          </Field>
        </div>

        <label
          htmlFor="recurrente"
          className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 transition-colors hover:border-slate-300"
        >
          <input
            id="recurrente"
            name="recurrente"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary accent-primary"
          />
          <span>
            <span className="block text-[12px] font-semibold text-ink">Gasto recurrente</span>
            <span className="block text-[11px] text-ink-muted">
              Arriendo, servicios básicos o sueldos que se repiten cada mes.
            </span>
          </span>
        </label>

        <div className="flex items-start gap-2.5 rounded-xl bg-primary-50/60 px-3.5 py-2.5">
          <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[11px] leading-relaxed text-primary-800">
            El gasto se descuenta directamente de la utilidad neta del mes seleccionado.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <SubmitButton pendingLabel="Registrando gasto…">
          <Wallet className="h-4 w-4" />
          Registrar gasto
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}

export function GastoDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Registrar gasto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            <Wallet className="h-3.5 w-3.5" />
            Egreso · operativo
          </div>
          <DialogTitle>Registrar gasto</DialogTitle>
          <DialogDescription>
            Arriendo, servicios básicos, sueldos, mantenimiento, publicidad y otros.
          </DialogDescription>
        </DialogHeader>
        <GastoForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
