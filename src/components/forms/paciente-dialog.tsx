"use client";

import { useActionState, useEffect, useState } from "react";
import { UserPlus, UserRoundPen } from "lucide-react";
import { actualizarPaciente, crearPaciente } from "@/app/actions/pacientes";
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
import type { ActionState, Paciente } from "@/lib/types";

const initialState: ActionState = { ok: false };

function PacienteForm({
  paciente,
  onSuccess,
}: {
  paciente?: Paciente;
  onSuccess: () => void;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    paciente ? actualizarPaciente : crearPaciente,
    initialState,
  );

  useEffect(() => {
    if (state.ok) onSuccess();
  }, [state.ok, onSuccess]);

  return (
    <form action={formAction}>
      {paciente && <input type="hidden" name="id" value={paciente.id} />}
      <div className="space-y-5 px-6 pb-5">
        {state.message && !state.ok && (
          <Alert variant="error" title="No se pudo guardar">
            {state.message}
          </Alert>
        )}

        <FormSection title="Identificación">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Cédula / RUC" htmlFor="cedula" required error={state.errors?.cedula}>
              <Input
                id="cedula"
                name="cedula"
                defaultValue={paciente?.cedula ?? ""}
                placeholder="1712345678"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Ocupación" htmlFor="ocupacion">
              <Input
                id="ocupacion"
                name="ocupacion"
                defaultValue={paciente?.ocupacion ?? ""}
                placeholder="Ej. Docente"
                autoComplete="off"
              />
            </Field>
            <Field label="Nombres" htmlFor="nombres" required error={state.errors?.nombres}>
              <Input
                id="nombres"
                name="nombres"
                defaultValue={paciente?.nombres ?? ""}
                placeholder="María Fernanda"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Apellidos" htmlFor="apellidos" required error={state.errors?.apellidos}>
              <Input
                id="apellidos"
                name="apellidos"
                defaultValue={paciente?.apellidos ?? ""}
                placeholder="Guamaní Toapanta"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Fecha de nacimiento" htmlFor="fechaNacimiento" hint="Opcional">
              <Input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                defaultValue={paciente?.fechaNacimiento?.slice(0, 10) ?? ""}
              />
            </Field>
            <Field label="Edad" htmlFor="edad" hint="Se calcula si hay fecha">
              <Input
                id="edad"
                name="edad"
                type="number"
                min="0"
                max="120"
                defaultValue={paciente?.edad ?? ""}
                placeholder="34"
              />
            </Field>
            <Field label="Género" htmlFor="genero">
              <Select id="genero" name="genero" defaultValue={paciente?.genero ?? ""}>
                <option value="">Sin especificar</option>
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no indicar">Prefiero no indicar</option>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Contacto">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Teléfono / WhatsApp"
              htmlFor="telefono"
              required
              error={state.errors?.telefono}
            >
              <Input
                id="telefono"
                name="telefono"
                defaultValue={paciente?.telefono ?? ""}
                placeholder="099 876 5432"
                autoComplete="off"
                required
              />
            </Field>
            <Field label="Correo electrónico" htmlFor="email" hint="Opcional">
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={paciente?.email ?? ""}
                placeholder="paciente@correo.com"
                autoComplete="off"
              />
            </Field>
            <Field label="Dirección" htmlFor="direccion" className="sm:col-span-2">
              <Input
                id="direccion"
                name="direccion"
                defaultValue={paciente?.direccion ?? ""}
                placeholder="Av. Eloy Alfaro y Naciones Unidas, Quito"
                autoComplete="off"
              />
            </Field>
          </div>
        </FormSection>

        <Field label="Notas clínicas" htmlFor="notas" hint="Opcional">
          <Textarea
            id="notas"
            name="notas"
            rows={2}
            defaultValue={paciente?.notas ?? ""}
            placeholder="Alergias, antecedentes relevantes, observaciones…"
          />
        </Field>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancelar
        </Button>
        <SubmitButton pendingLabel="Guardando paciente…">
          {paciente ? <UserRoundPen className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
          {paciente ? "Guardar cambios" : "Registrar paciente"}
        </SubmitButton>
      </DialogFooter>
    </form>
  );
}

export function PacienteDialog({
  paciente,
  trigger,
}: {
  paciente?: Paciente;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <UserPlus className="h-4 w-4" />
            Nuevo paciente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            <UserPlus className="h-3.5 w-3.5" />
            Ficha clínica
          </div>
          <DialogTitle>{paciente ? "Editar paciente" : "Registrar nuevo paciente"}</DialogTitle>
          <DialogDescription>
            {paciente
              ? "Actualiza los datos de contacto y la información clínica básica."
              : "Completa los datos personales. El historial optométrico de 6 secciones se abre desde la ficha del paciente."}
          </DialogDescription>
        </DialogHeader>
        <PacienteForm paciente={paciente} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
