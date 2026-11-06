"use client";

import { useActionState, useEffect, useState } from "react";
import { Banknote, Plus } from "lucide-react";
import { registrarPago } from "@/app/actions/contabilidad";
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
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import { METODO_PAGO_OPTIONS } from "@/lib/constants";
import { money, toDateInput } from "@/lib/format";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

function PagoForm({
  ventaId,
  codigo,
  saldo,
  onSuccess,
}: {
  ventaId: string;
  codigo: string;
  saldo: number;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(registrarPago, initialState);

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction}>
      <input type="hidden" name="ventaId" value={ventaId} />
      <div className="space-y-4 px-6 pb-5">
        {state.message && !state.ok && (
          <Alert variant="error" title="No se pudo registrar el abono">
            {state.message}
          </Alert>
        )}

        <div className="flex items-center justify-between rounded-xl border border-primary-100 bg-primary-50/60 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-primary-700">
              Saldo pendiente
            </p>
            <p className="mt-0.5 font-display text-lg font-bold tabular-nums text-primary-900">
              {money(saldo)}
            </p>
          </div>
          <span className="rounded-lg bg-white px-2.5 py-1 text-[10.5px] font-semibold text-primary ring-1 ring-inset ring-primary-200">
            {codigo}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Monto del abono ($)" htmlFor="monto" required error={state.errors?.monto}>
            <Input
              id="monto"
              name="monto"
              type="number"
              min="0.01"
              max={saldo}
              step="0.01"
              inputMode="decimal"
              defaultValue={saldo.toFixed(2)}
              required
            />
          </Field>
          <Field label="Fecha del abono" htmlFor="fechaPago" required>
            <Input
              id="fechaPago"
              type="date"
              name="fecha"
              defaultValue={toDateInput()}
              required
            />
          </Field>
        </div>

        <Field label="Método de pago" htmlFor="metodo">
          <Select id="metodo" name="metodo" defaultValue="EFECTIVO">
            {METODO_PAGO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Nota" htmlFor="nota" hint="Opcional">
          <Textarea id="nota" name="nota" rows={2} placeholder="Ej. Pago al retirar los lentes." />
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <SubmitButton pendingLabel="Registrando abono…">
          <Banknote className="h-4 w-4" />
          Registrar abono
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}

export function PagoDialog({
  ventaId,
  codigo,
  saldo,
  trigger,
}: {
  ventaId: string;
  codigo: string;
  saldo: number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" variant="subtle">
            <Plus className="h-3.5 w-3.5" />
            Abonar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            <Banknote className="h-3.5 w-3.5" />
            Cuentas por cobrar
          </div>
          <DialogTitle>Registrar abono</DialogTitle>
          <DialogDescription>
            Suma un pago parcial o la cancelación total del saldo de la venta {codigo}.
          </DialogDescription>
        </DialogHeader>
        <PagoForm
          ventaId={ventaId}
          codigo={codigo}
          saldo={saldo}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
