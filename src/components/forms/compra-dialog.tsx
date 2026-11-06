"use client";

import { useActionState, useEffect, useState } from "react";
import { PackagePlus, Plus } from "lucide-react";
import { crearCompra } from "@/app/actions/contabilidad";
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
import { CATEGORIA_COMPRA_OPTIONS } from "@/lib/constants";
import { toDateInput } from "@/lib/format";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { ok: false };

function CompraForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(crearCompra, initialState);

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
          <Field label="Fecha de compra" htmlFor="fecha" required>
            <Input id="fecha" type="date" name="fecha" defaultValue={toDateInput()} required />
          </Field>
          <Field label="Categoría" htmlFor="categoria" required error={state.errors?.categoria}>
            <Select id="categoria" name="categoria" defaultValue="ARMAZONES">
              {CATEGORIA_COMPRA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field
          label="Proveedor"
          htmlFor="proveedor"
          required
          error={state.errors?.proveedor}
        >
          <Input
            id="proveedor"
            name="proveedor"
            placeholder="Ej. Laboratorio Óptico Visión Andina"
            autoComplete="off"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="RUC / Cédula" htmlFor="proveedorRuc" hint="Opcional">
            <Input id="proveedorRuc" name="proveedorRuc" placeholder="179…" autoComplete="off" />
          </Field>
          <Field label="N° factura" htmlFor="numeroComprobante" hint="Opcional" className="sm:col-span-2">
            <Input
              id="numeroComprobante"
              name="numeroComprobante"
              placeholder="001-001-000001234"
              autoComplete="off"
            />
          </Field>
        </div>

        <Field
          label="Detalle de la compra"
          htmlFor="descripcion"
          required
          error={state.errors?.descripcion}
        >
          <Input
            id="descripcion"
            name="descripcion"
            placeholder="Ej. 20 pares de lunas monofocales antirreflejo"
            autoComplete="off"
          />
        </Field>

        <Field label="Costo total ($)" htmlFor="total" required error={state.errors?.total}>
          <Input
            id="total"
            name="total"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
            required
          />
        </Field>

        <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-[11px] leading-relaxed text-ink-muted">
          Las compras se descuentan del flujo de caja del mes en que se registran y alimentan el
          costo de mercadería del reporte contable.
        </p>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <SubmitButton pendingLabel="Registrando compra…">
          <PackagePlus className="h-4 w-4" />
          Registrar compra
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}

export function CompraDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            Nueva compra
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            <PackagePlus className="h-3.5 w-3.5" />
            Egreso · mercadería
          </div>
          <DialogTitle>Registrar compra</DialogTitle>
          <DialogDescription>
            Armazones, lunas de laboratorio, lentes de contacto, insumos y equipos.
          </DialogDescription>
        </DialogHeader>
        <CompraForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
