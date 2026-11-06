"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarDays, Plus, ReceiptText, Wallet } from "lucide-react";
import { crearVenta } from "@/app/actions/contabilidad";
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
import { Field, FormSection } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  ESTADO_ENTREGA_LABEL,
  METODO_PAGO_OPTIONS,
  CATEGORIA_VENTA_OPTIONS,
} from "@/lib/constants";
import { money, toDateInput } from "@/lib/format";
import type { ActionState, CategoriaVenta, EstadoEntrega, Paciente } from "@/lib/types";
import { cn } from "@/lib/utils";

type PacienteOption = Pick<Paciente, "id" | "nombres" | "apellidos">;

const initialState: ActionState = { ok: false };

function VentaForm({
  pacientes,
  defaultPacienteId,
  defaultFecha,
  defaultDescripcion,
  defaultCategoria,
  defaultNotas,
  historiaId,
  onSuccess,
}: {
  pacientes: PacienteOption[];
  defaultPacienteId?: string;
  defaultFecha?: string;
  defaultDescripcion?: string;
  defaultCategoria?: CategoriaVenta;
  defaultNotas?: string;
  historiaId?: string;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(crearVenta, initialState);
  const [total, setTotal] = useState("");
  const [anticipo, setAnticipo] = useState("");

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  const totalNum = Number(total) || 0;
  const anticipoNum = Number(anticipo) || 0;
  const saldo = Math.max(0, Math.round((totalNum - anticipoNum) * 100) / 100);

  return (
    <form action={formAction}>
      {historiaId && <input type="hidden" name="historiaId" value={historiaId} />}
      <div className="space-y-5 px-6 pb-5">
        {state.message && !state.ok && (
          <Alert variant="error" title="No se pudo registrar">
            {state.message}
          </Alert>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Fecha de venta" htmlFor="fecha" required error={state.errors?.fecha}>
            <Input
              id="fecha"
              type="date"
              name="fecha"
              defaultValue={defaultFecha ?? toDateInput()}
              required
            />
          </Field>
          <Field label="Categoría" htmlFor="categoria" required error={state.errors?.categoria}>
            <Select id="categoria" name="categoria" defaultValue={defaultCategoria ?? "LUNAS"}>
              {CATEGORIA_VENTA_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <FormSection title="Cliente" description="Asocia la venta a un paciente o registra un cliente ocasional.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Paciente registrado" htmlFor="pacienteId">
              <Select id="pacienteId" name="pacienteId" defaultValue={defaultPacienteId ?? ""}>
                <option value="">Cliente ocasional</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.apellidos}, {paciente.nombres}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Nombre de referencia" htmlFor="clienteNombre" error={state.errors?.clienteNombre}>
              <Input
                id="clienteNombre"
                name="clienteNombre"
                placeholder="Ej. Sofía Herrera"
                autoComplete="off"
              />
            </Field>
          </div>
        </FormSection>

        <Field
          label="Detalle de la venta"
          htmlFor="descripcion"
          required
          error={state.errors?.descripcion}
        >
          <Input
            id="descripcion"
            name="descripcion"
            defaultValue={defaultDescripcion ?? ""}
            placeholder="Ej. Lunas progresivas digitales + antirreflejo"
            autoComplete="off"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Total ($)" htmlFor="total" required error={state.errors?.total}>
            <Input
              id="total"
              name="total"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={total}
              onChange={(event) => setTotal(event.target.value)}
              required
            />
          </Field>
          <Field
            label="Abono / anticipo ($)"
            htmlFor="anticipo"
            hint="Opcional"
            error={state.errors?.anticipo}
          >
            <Input
              id="anticipo"
              name="anticipo"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              value={anticipo}
              onChange={(event) => setAnticipo(event.target.value)}
            />
          </Field>
          <div className="flex flex-col justify-end">
            <div className="flex h-10 items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3">
              <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink-subtle">
                Saldo
              </span>
              <span
                className={cn(
                  "text-[13px] font-bold tabular-nums",
                  saldo > 0 ? "text-accent-700" : "text-emerald-600",
                )}
              >
                {money(saldo)}
              </span>
            </div>
          </div>
        </div>

        {totalNum > 0 && (
          <div className="flex items-start gap-2.5 rounded-xl border border-primary-100 bg-primary-50/60 px-3.5 py-2.5">
            <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <p className="text-[11px] leading-relaxed text-primary-800">
              {saldo > 0 ? (
                <>
                  Se registrará un abono de <strong>{money(anticipoNum)}</strong> y un saldo
                  pendiente de <strong>{money(saldo)}</strong> en cuentas por cobrar.
                </>
              ) : anticipoNum > 0 ? (
                <>La venta quedará marcada como <strong>pagada</strong>.</>
              ) : (
                <>Sin abono inicial, la venta quedará como <strong>pendiente de pago</strong>.</>
              )}
            </p>
          </div>
        )}

        <FormSection title="Pago y entrega">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Método de pago" error={state.errors?.metodoPago}>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
                {METODO_PAGO_OPTIONS.map((option, index) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="metodoPago"
                      value={option.value}
                      defaultChecked={index === 0}
                      className="peer sr-only"
                    />
                    <span className="flex h-8 items-center justify-center rounded-lg text-[11px] font-semibold text-ink-muted transition-all peer-checked:bg-white peer-checked:text-primary peer-checked:shadow-sm">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Estado de entrega" htmlFor="estadoEntrega">
              <Select id="estadoEntrega" name="estadoEntrega" defaultValue="ENTREGADO">
                {(
                  Object.entries(ESTADO_ENTREGA_LABEL) as Array<[EstadoEntrega, string]>
                ).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </FormSection>

        <Field label="Notas internas" htmlFor="notas" hint="Opcional">
          <Textarea
            id="notas"
            name="notas"
            rows={2}
            defaultValue={defaultNotas ?? ""}
            placeholder="Ej. Enviado al laboratorio, entrega en 5 días hábiles…"
          />
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <SubmitButton variant="accent" pendingLabel="Registrando venta…">
          <ReceiptText className="h-4 w-4" />
          Registrar venta
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}

export function VentaDialog({
  pacientes,
  trigger,
  defaultPacienteId,
  defaultFecha,
  defaultDescripcion,
  defaultCategoria,
  defaultNotas,
  historiaId,
}: {
  pacientes: PacienteOption[];
  trigger?: React.ReactNode;
  defaultPacienteId?: string;
  defaultFecha?: string;
  defaultDescripcion?: string;
  defaultCategoria?: CategoriaVenta;
  defaultNotas?: string;
  historiaId?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="accent">
            <Plus className="h-4 w-4" />
            Nueva venta
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
            <CalendarDays className="h-3.5 w-3.5" />
            Ingreso
          </div>
          <DialogTitle>Registrar venta</DialogTitle>
          <DialogDescription>
            Lunas, armazones, lentes de contacto, accesorios o consulta optométrica. Admite abonos
            y saldos pendientes.
          </DialogDescription>
        </DialogHeader>
        <VentaForm
          pacientes={pacientes}
          defaultPacienteId={defaultPacienteId}
          defaultFecha={defaultFecha}
          defaultDescripcion={defaultDescripcion}
          defaultCategoria={defaultCategoria}
          defaultNotas={defaultNotas}
          historiaId={historiaId}
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
