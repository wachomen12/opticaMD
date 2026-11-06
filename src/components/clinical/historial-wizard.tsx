"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  Glasses,
  HeartPulse,
  MessageSquareText,
  Save,
  Stethoscope,
} from "lucide-react";
import { guardarHistoria } from "@/app/actions/historial";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/forms/field";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  ANTECEDENTES_FAMILIARES,
  ANTECEDENTES_OFTALMOLOGICOS,
  ANTECEDENTES_PATOLOGICOS,
  AV_FILAS,
  DIAGNOSTICOS,
  GENERO_OPTIONS,
  MOTIVOS_CONSULTA,
  RX_FILAS,
  TIPOS_LENTE,
  TRATAMIENTOS,
} from "@/lib/clinical";
import { toDateInput } from "@/lib/format";
import type { ActionState, HistoriaClinica, Paciente } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "filiacion",
    code: "01",
    label: "Filiación y control",
    short: "Filiación",
    icon: ClipboardList,
    title: "Filiación y control clínico",
    description: "Datos del paciente, uso previo de corrección óptica y fecha de evaluación.",
  },
  {
    id: "motivo",
    code: "02",
    label: "Motivo de consulta",
    short: "Motivo",
    icon: MessageSquareText,
    title: "Motivo de consulta",
    description: "Registro de sintomatología visual y motivo principal de atención.",
  },
  {
    id: "antecedentes",
    code: "03",
    label: "Antecedentes",
    short: "Antecedentes",
    icon: HeartPulse,
    title: "Antecedentes clínicos",
    description: "Antecedentes patológicos sistémicos, oftalmológicos y hereditarios.",
  },
  {
    id: "examen",
    code: "04",
    label: "Examen optométrico",
    short: "Examen AV",
    icon: Eye,
    title: "Examen optométrico y segmento posterior",
    description: "Agudeza visual (VL / VP) por ojo y biomicroscopía / fondo de ojo.",
  },
  {
    id: "diagnostico",
    code: "05",
    label: "Diagnóstico",
    short: "Diagnóstico",
    icon: Stethoscope,
    title: "Diagnóstico optométrico",
    description: "Determinación refractiva, acomodativa o binocular.",
  },
  {
    id: "prescripcion",
    code: "06",
    label: "Prescripción",
    short: "Receta RX",
    icon: Glasses,
    title: "Prescripción optométrica final (RX)",
    description: "Fórmula dióptrica OD/OI, diseño de lente y tratamientos ópticos.",
  },
] as const;

type FormState = {
  fecha: string;
  usaLentes: boolean;
  ultimoControlVisual: string;
  ultimoCambioLentes: string;
  edad: string;
  genero: string;
  ocupacion: string;
  telefono: string;
  direccion: string;

  motivosConsulta: string[];
  motivoConsultaOtros: string;

  antecedentesPatologicos: string[];
  antecedentesPatologicosOtros: string;
  antecedentesOftalmologicos: string[];
  antecedentesOftalmologicosOtros: string;
  antecedentesFamiliares: string[];
  antecedentesFamiliaresOtros: string;

  avSinCorreccionVL_OD: string;
  avSinCorreccionVL_OI: string;
  avSinCorreccionVP_OD: string;
  avSinCorreccionVP_OI: string;
  avConCorreccionVL_OD: string;
  avConCorreccionVL_OI: string;
  avConCorreccionVP_OD: string;
  avConCorreccionVP_OI: string;

  papilaOptica: string;
  macula: string;
  retina: string;
  observacionesSegmentoPosterior: string;

  diagnosticos: string[];
  diagnosticoOtro: string;

  esfera_OD: string;
  esfera_OI: string;
  cilindro_OD: string;
  cilindro_OI: string;
  eje_OD: string;
  eje_OI: string;
  adicion_OD: string;
  adicion_OI: string;
  altura_OD: string;
  altura_OI: string;
  dnp_OD: string;
  dnp_OI: string;
  avFinal_OD: string;
  avFinal_OI: string;

  tipoLenteRecomendado: string[];
  tipoLenteOtro: string;
  tratamientosRecomendados: string[];
  tratamientoOtro: string;
};

const initialState: ActionState = { ok: false };

const str = (value: string | null | undefined) => value ?? "";

function inicial(paciente: Paciente, historia: HistoriaClinica | null): FormState {
  return {
    fecha: historia ? toDateInput(historia.fecha) : toDateInput(),
    usaLentes: historia?.usaLentes ?? false,
    ultimoControlVisual: historia?.ultimoControlVisual ? toDateInput(historia.ultimoControlVisual) : "",
    ultimoCambioLentes: historia?.ultimoCambioLentes ? toDateInput(historia.ultimoCambioLentes) : "",
    edad: paciente.edad ? String(paciente.edad) : "",
    genero: paciente.genero ?? "",
    ocupacion: paciente.ocupacion ?? "",
    telefono: paciente.telefono ?? "",
    direccion: paciente.direccion ?? "",

    motivosConsulta: historia?.motivosConsulta ?? [],
    motivoConsultaOtros: str(historia?.motivoConsultaOtros),

    antecedentesPatologicos: historia?.antecedentesPatologicos ?? [],
    antecedentesPatologicosOtros: str(historia?.antecedentesPatologicosOtros),
    antecedentesOftalmologicos: historia?.antecedentesOftalmologicos ?? [],
    antecedentesOftalmologicosOtros: str(historia?.antecedentesOftalmologicosOtros),
    antecedentesFamiliares: historia?.antecedentesFamiliares ?? [],
    antecedentesFamiliaresOtros: str(historia?.antecedentesFamiliaresOtros),

    avSinCorreccionVL_OD: str(historia?.avSinCorreccionVL_OD),
    avSinCorreccionVL_OI: str(historia?.avSinCorreccionVL_OI),
    avSinCorreccionVP_OD: str(historia?.avSinCorreccionVP_OD),
    avSinCorreccionVP_OI: str(historia?.avSinCorreccionVP_OI),
    avConCorreccionVL_OD: str(historia?.avConCorreccionVL_OD),
    avConCorreccionVL_OI: str(historia?.avConCorreccionVL_OI),
    avConCorreccionVP_OD: str(historia?.avConCorreccionVP_OD),
    avConCorreccionVP_OI: str(historia?.avConCorreccionVP_OI),

    papilaOptica: str(historia?.papilaOptica),
    macula: str(historia?.macula),
    retina: str(historia?.retina),
    observacionesSegmentoPosterior: str(historia?.observacionesSegmentoPosterior),

    diagnosticos: historia?.diagnosticos ?? [],
    diagnosticoOtro: str(historia?.diagnosticoOtro),

    esfera_OD: str(historia?.esfera_OD),
    esfera_OI: str(historia?.esfera_OI),
    cilindro_OD: str(historia?.cilindro_OD),
    cilindro_OI: str(historia?.cilindro_OI),
    eje_OD: str(historia?.eje_OD),
    eje_OI: str(historia?.eje_OI),
    adicion_OD: str(historia?.adicion_OD),
    adicion_OI: str(historia?.adicion_OI),
    altura_OD: str(historia?.altura_OD),
    altura_OI: str(historia?.altura_OI),
    dnp_OD: str(historia?.dnp_OD),
    dnp_OI: str(historia?.dnp_OI),
    avFinal_OD: str(historia?.avFinal_OD),
    avFinal_OI: str(historia?.avFinal_OI),

    tipoLenteRecomendado: historia?.tipoLenteRecomendado ?? [],
    tipoLenteOtro: str(historia?.tipoLenteOtro),
    tratamientosRecomendados: historia?.tratamientosRecomendados ?? [],
    tratamientoOtro: str(historia?.tratamientoOtro),
  };
}

function toggleInList(list: string[], value: string, exclusiveNone = false): string[] {
  if (list.includes(value)) return list.filter((item) => item !== value);
  if (exclusiveNone && value === "Ninguno") return ["Ninguno"];
  const rest = exclusiveNone ? list.filter((item) => item !== "Ninguno") : list;
  return [...rest, value];
}

function CheckboxGrid({
  name,
  options,
  selected,
  onToggle,
  columns = "sm:grid-cols-2",
}: {
  name: string;
  options: readonly string[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-1.5", columns)}>
      {options.map((option) => {
        const checked = selected.includes(option);
        return (
          <label
            key={option}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-md border px-3 py-2 text-[12px] transition-colors duration-100 select-none",
              checked
                ? "border-primary bg-primary-50/80 font-medium text-primary-900"
                : "border-slate-200 bg-white text-ink-muted hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={checked}
              onChange={() => onToggle(option)}
              className="h-3.5 w-3.5 shrink-0 rounded-xs border-slate-300 accent-primary"
            />
            <span className="leading-snug">{option}</span>
          </label>
        );
      })}
    </div>
  );
}

function OtrosInput({
  name,
  value,
  onChange,
  placeholder,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mt-3 max-w-lg border-l-2 border-accent pl-3">
      <Field label="Especificación clínica adicional" htmlFor={name}>
        <Input
          id={name}
          name={name}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </Field>
    </div>
  );
}

function EyeHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <th
      className={cn(
        "px-3 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-200",
        align === "center" ? "text-center" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

function SectionCardHeader({
  code,
  title,
  description,
  icon: Icon,
  right,
}: {
  code: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-slate-200 bg-white text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              SECCIÓN {code} / 06
            </span>
            <span className="text-slate-300">·</span>
            <h2 className="font-display text-[14px] font-semibold text-ink">{title}</h2>
          </div>
          <p className="text-[11px] text-ink-muted">{description}</p>
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}

export function HistorialWizard({
  paciente,
  historia,
}: {
  paciente: Paciente;
  historia: HistoriaClinica | null;
}) {
  const router = useRouter();
  const [active, setActive] = useState<string>(STEPS[0].id);
  const [form, setForm] = useState<FormState>(() => inicial(paciente, historia));
  const [state, formAction] = useActionState<ActionState, FormData>(
    guardarHistoria,
    initialState,
  );

  const index = STEPS.findIndex((step) => step.id === active);

  useEffect(() => {
    if (state.ok && state.id) {
      router.replace(`/pacientes/${paciente.id}/historial?hc=${state.id}`, { scroll: false });
      router.refresh();
    }
  }, [state, router, paciente.id]);

  function setValue(key: keyof FormState, value: string | boolean | string[]) {
    setForm((prev) => ({ ...prev, [key]: value }) as FormState);
  }

  function next() {
    if (index < STEPS.length - 1) setActive(STEPS[index + 1].id);
  }
  function prev() {
    if (index > 0) setActive(STEPS[index - 1].id);
  }

  const step = STEPS[index];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="pacienteId" value={paciente.id} />
      {historia && <input type="hidden" name="id" value={historia.id} />}

      {state.message && (
        <Alert
          variant={state.ok ? "success" : "error"}
          title={state.ok ? "Registro clínico actualizado" : "Verifique los campos requeridos"}
        >
          {state.message}
        </Alert>
      )}

      <Tabs value={active} onValueChange={setActive} className="space-y-3">
        {/* Navegador técnico segmentado de 6 etapas */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xs">
          <TabsList className="grid w-full grid-cols-2 divide-x divide-y divide-slate-200 bg-transparent p-0 sm:grid-cols-3 xl:grid-cols-6 xl:divide-y-0">
            {STEPS.map((item, i) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              const isDone = i < index;
              return (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className={cn(
                    "group relative flex h-auto flex-col items-start gap-1 rounded-none px-3 py-2.5 text-left transition-colors",
                    "data-[state=active]:bg-primary-50/60 data-[state=active]:shadow-none",
                    "hover:bg-slate-50/90",
                  )}
                >
                  {isActive && (
                    <span className="absolute inset-x-0 bottom-0 h-[2.5px] bg-accent" />
                  )}
                  <span className="flex w-full items-center justify-between font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-subtle group-data-[state=active]:text-primary">
                    <span>ETAPA {item.code}</span>
                    {isDone ? (
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    ) : isActive ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    ) : null}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Icon
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        isActive ? "text-primary" : "text-slate-400",
                      )}
                    />
                    <span className="truncate text-[12px] font-semibold text-ink">
                      {item.short}
                    </span>
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* ── Paso 1: Filiación y control ─────────────────────── */}
        <TabsContent value="filiacion" forceMount className="mt-0 data-[state=inactive]:hidden">
          <div className="surface-card overflow-hidden">
            <SectionCardHeader
              code="01"
              title={step.title}
              description={step.description}
              icon={ClipboardList}
              right={
                <Badge variant={historia ? "success" : "warning"}>
                  {historia ? `EXPEDIENTE ${historia.numeroHistoria}` : "NUEVO CONTROL"}
                </Badge>
              }
            />

            <div className="space-y-4 p-4 sm:p-5">
              {/* Cinta de identificación del paciente */}
              <div className="grid gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-3.5 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="label-overline">Paciente titular</p>
                  <p className="mt-0.5 text-[13px] font-semibold text-ink">
                    {paciente.nombres} {paciente.apellidos}
                  </p>
                </div>
                <div>
                  <p className="label-overline">Identificación (CI / RUC)</p>
                  <p className="mt-0.5 font-mono text-[12.5px] font-medium text-ink">
                    {paciente.cedula ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="label-overline">N° Historia Clínica</p>
                  <p className="mt-0.5 font-mono text-[12.5px] font-semibold text-primary">
                    {historia?.numeroHistoria ?? "Asignación automática"}
                  </p>
                </div>
                <Field label="Fecha de evaluación" htmlFor="fecha">
                  <Input
                    id="fecha"
                    name="fecha"
                    type="date"
                    value={form.fecha}
                    onChange={(event) => setValue("fecha", event.target.value)}
                    className="font-mono text-xs"
                    required
                  />
                </Field>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Edad (años)" htmlFor="edad">
                  <Input
                    id="edad"
                    name="edad"
                    type="number"
                    min="0"
                    max="129"
                    value={form.edad}
                    onChange={(event) => setValue("edad", event.target.value)}
                    placeholder="34"
                    className="font-mono"
                  />
                </Field>
                <Field label="Género" htmlFor="genero">
                  <Select
                    id="genero"
                    name="genero"
                    value={form.genero}
                    onChange={(event) => setValue("genero", event.target.value)}
                  >
                    <option value="">Sin especificar</option>
                    {GENERO_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Ocupación / Actividad visual" htmlFor="ocupacion">
                  <Input
                    id="ocupacion"
                    name="ocupacion"
                    value={form.ocupacion}
                    onChange={(event) => setValue("ocupacion", event.target.value)}
                    placeholder="Ej. Docente, Conductor, Oficina"
                    autoComplete="off"
                  />
                </Field>
                <Field
                  label="Teléfono / WhatsApp"
                  htmlFor="telefono"
                  required
                  error={state.errors?.telefono}
                >
                  <Input
                    id="telefono"
                    name="telefono"
                    value={form.telefono}
                    onChange={(event) => setValue("telefono", event.target.value)}
                    placeholder="099 876 5432"
                    className="font-mono"
                    autoComplete="off"
                  />
                </Field>
                <Field label="Dirección domiciliaria" htmlFor="direccion" className="sm:col-span-2">
                  <Input
                    id="direccion"
                    name="direccion"
                    value={form.direccion}
                    onChange={(event) => setValue("direccion", event.target.value)}
                    placeholder="Ciudad, sector y calle principal"
                    autoComplete="off"
                  />
                </Field>
              </div>

              <div className="grid gap-4 rounded-md border border-slate-200 bg-slate-50/40 p-3.5 sm:grid-cols-3">
                <div>
                  <p className="label-overline mb-1.5">¿Usa lentes actualmente?</p>
                  <div className="inline-flex rounded-md border border-slate-200 bg-white p-0.5">
                    {[
                      { label: "Sí", value: true },
                      { label: "No", value: false },
                    ].map((option) => (
                      <label key={option.label} className="cursor-pointer">
                        <input
                          type="radio"
                          name="usaLentes"
                          value={option.value ? "true" : "false"}
                          checked={form.usaLentes === option.value}
                          onChange={() => setValue("usaLentes", option.value)}
                          className="peer sr-only"
                        />
                        <span
                          className={cn(
                            "flex h-7 min-w-[56px] items-center justify-center rounded-xs px-3 text-[11.5px] font-semibold transition-colors peer-checked:bg-primary peer-checked:text-white",
                            form.usaLentes === option.value
                              ? "text-white"
                              : "text-ink-muted hover:text-ink",
                          )}
                        >
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <Field label="Último control visual" htmlFor="ultimoControlVisual">
                  <Input
                    id="ultimoControlVisual"
                    name="ultimoControlVisual"
                    type="date"
                    value={form.ultimoControlVisual}
                    onChange={(event) => setValue("ultimoControlVisual", event.target.value)}
                    className="font-mono text-xs"
                  />
                </Field>
                <Field label="Último cambio de lentes" htmlFor="ultimoCambioLentes">
                  <Input
                    id="ultimoCambioLentes"
                    name="ultimoCambioLentes"
                    type="date"
                    value={form.ultimoCambioLentes}
                    onChange={(event) => setValue("ultimoCambioLentes", event.target.value)}
                    className="font-mono text-xs"
                  />
                </Field>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Paso 2: Motivo de consulta ──────────────────────── */}
        <TabsContent value="motivo" forceMount className="mt-0 data-[state=inactive]:hidden">
          <div className="surface-card overflow-hidden">
            <SectionCardHeader
              code="02"
              title={step.title}
              description={step.description}
              icon={MessageSquareText}
            />
            <div className="p-4 sm:p-5">
              <CheckboxGrid
                name="motivosConsulta"
                options={MOTIVOS_CONSULTA}
                selected={form.motivosConsulta}
                onToggle={(value) =>
                  setValue("motivosConsulta", toggleInList(form.motivosConsulta, value))
                }
                columns="sm:grid-cols-2 lg:grid-cols-3"
              />
              {form.motivosConsulta.includes("Otros") && (
                <OtrosInput
                  name="motivoConsultaOtros"
                  value={form.motivoConsultaOtros}
                  onChange={(value) => setValue("motivoConsultaOtros", value)}
                  placeholder="Describa el motivo de consulta adicional"
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Paso 3: Antecedentes ────────────────────────────── */}
        <TabsContent value="antecedentes" forceMount className="mt-0 data-[state=inactive]:hidden">
          <div className="surface-card overflow-hidden">
            <SectionCardHeader
              code="03"
              title={step.title}
              description={step.description}
              icon={HeartPulse}
            />
            <div className="grid gap-4 p-4 sm:p-5 xl:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3.5">
                <p className="border-b border-slate-200 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  1. Patológicos personales
                </p>
                <div className="mt-2.5">
                  <CheckboxGrid
                    name="antecedentesPatologicos"
                    options={ANTECEDENTES_PATOLOGICOS}
                    selected={form.antecedentesPatologicos}
                    onToggle={(value) =>
                      setValue(
                        "antecedentesPatologicos",
                        toggleInList(form.antecedentesPatologicos, value, true),
                      )
                    }
                    columns="grid-cols-1"
                  />
                </div>
                {form.antecedentesPatologicos.includes("Otros") && (
                  <OtrosInput
                    name="antecedentesPatologicosOtros"
                    value={form.antecedentesPatologicosOtros}
                    onChange={(value) => setValue("antecedentesPatologicosOtros", value)}
                    placeholder="Especifique patología sistémica"
                  />
                )}
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3.5">
                <p className="border-b border-slate-200 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  2. Oftalmológicos
                </p>
                <div className="mt-2.5">
                  <CheckboxGrid
                    name="antecedentesOftalmologicos"
                    options={ANTECEDENTES_OFTALMOLOGICOS}
                    selected={form.antecedentesOftalmologicos}
                    onToggle={(value) =>
                      setValue(
                        "antecedentesOftalmologicos",
                        toggleInList(form.antecedentesOftalmologicos, value, true),
                      )
                    }
                    columns="grid-cols-1"
                  />
                </div>
                {form.antecedentesOftalmologicos.includes("Otros") && (
                  <OtrosInput
                    name="antecedentesOftalmologicosOtros"
                    value={form.antecedentesOftalmologicosOtros}
                    onChange={(value) => setValue("antecedentesOftalmologicosOtros", value)}
                    placeholder="Especifique antecedente ocular"
                  />
                )}
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3.5">
                <p className="border-b border-slate-200 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  3. Familiares
                </p>
                <div className="mt-2.5">
                  <CheckboxGrid
                    name="antecedentesFamiliares"
                    options={ANTECEDENTES_FAMILIARES}
                    selected={form.antecedentesFamiliares}
                    onToggle={(value) =>
                      setValue(
                        "antecedentesFamiliares",
                        toggleInList(form.antecedentesFamiliares, value),
                      )
                    }
                    columns="grid-cols-1"
                  />
                </div>
                {form.antecedentesFamiliares.includes("Otros") && (
                  <OtrosInput
                    name="antecedentesFamiliaresOtros"
                    value={form.antecedentesFamiliaresOtros}
                    onChange={(value) => setValue("antecedentesFamiliaresOtros", value)}
                    placeholder="Especifique antecedente familiar"
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Paso 4: Examen optométrico ──────────────────────── */}
        <TabsContent value="examen" forceMount className="mt-0 data-[state=inactive]:hidden">
          <div className="surface-card overflow-hidden">
            <SectionCardHeader
              code="04"
              title={step.title}
              description={step.description}
              icon={Eye}
            />
            <div className="space-y-5 p-4 sm:p-5">
              <div>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  A. Matriz de Agudeza Visual (Escala Snellen)
                </p>
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <table className="w-full border-collapse">
                    <thead className="bg-secondary text-white">
                      <tr className="divide-x divide-white/10">
                        <EyeHeader>Evaluación</EyeHeader>
                        <EyeHeader align="center">Ojo derecho (OD)</EyeHeader>
                        <EyeHeader align="center">Ojo izquierdo (OI)</EyeHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {AV_FILAS.map((fila) => (
                        <tr
                          key={fila.label}
                          className="divide-x divide-slate-200 transition-colors hover:bg-slate-50/80"
                        >
                          <td className="bg-slate-50/50 px-3 py-2 text-[12px] font-medium text-ink">
                            {fila.label}
                          </td>
                          <td className="p-1.5">
                            <Input
                              name={fila.od}
                              value={form[fila.od]}
                              onChange={(event) => setValue(fila.od, event.target.value)}
                              placeholder="20/20"
                              aria-label={`${fila.label} OD`}
                              className="h-8 text-center font-mono text-[12.5px] font-medium tabular-nums"
                            />
                          </td>
                          <td className="p-1.5">
                            <Input
                              name={fila.oi}
                              value={form[fila.oi]}
                              onChange={(event) => setValue(fila.oi, event.target.value)}
                              placeholder="20/20"
                              aria-label={`${fila.label} OI`}
                              className="h-8 text-center font-mono text-[12.5px] font-medium tabular-nums"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50/40 p-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    H. Evaluación de segmento posterior
                  </p>
                  <span className="font-mono text-[10px] text-ink-subtle">Opcional según caso</span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <Field label="Papila óptica" htmlFor="papilaOptica">
                    <Input
                      id="papilaOptica"
                      name="papilaOptica"
                      value={form.papilaOptica}
                      onChange={(event) => setValue("papilaOptica", event.target.value)}
                      placeholder="Bordes definidos / Normal"
                    />
                  </Field>
                  <Field label="Mácula" htmlFor="macula">
                    <Input
                      id="macula"
                      name="macula"
                      value={form.macula}
                      onChange={(event) => setValue("macula", event.target.value)}
                      placeholder="Brillo foveal conservado"
                    />
                  </Field>
                  <Field label="Retina" htmlFor="retina">
                    <Input
                      id="retina"
                      name="retina"
                      value={form.retina}
                      onChange={(event) => setValue("retina", event.target.value)}
                      placeholder="Aplicada / Sin lesiones"
                    />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field
                    label="Observaciones del segmento posterior"
                    htmlFor="observacionesSegmentoPosterior"
                  >
                    <Textarea
                      id="observacionesSegmentoPosterior"
                      name="observacionesSegmentoPosterior"
                      rows={2}
                      value={form.observacionesSegmentoPosterior}
                      onChange={(event) =>
                        setValue("observacionesSegmentoPosterior", event.target.value)
                      }
                      placeholder="Hallazgos clínicos adicionales en fondo de ojo…"
                    />
                  </Field>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Paso 5: Diagnóstico ─────────────────────────────── */}
        <TabsContent value="diagnostico" forceMount className="mt-0 data-[state=inactive]:hidden">
          <div className="surface-card overflow-hidden">
            <SectionCardHeader
              code="05"
              title={step.title}
              description={step.description}
              icon={Activity}
            />
            <div className="p-4 sm:p-5">
              <CheckboxGrid
                name="diagnosticos"
                options={DIAGNOSTICOS}
                selected={form.diagnosticos}
                onToggle={(value) =>
                  setValue("diagnosticos", toggleInList(form.diagnosticos, value))
                }
                columns="sm:grid-cols-2 lg:grid-cols-3"
              />
              {form.diagnosticos.includes("Otro") && (
                <OtrosInput
                  name="diagnosticoOtro"
                  value={form.diagnosticoOtro}
                  onChange={(value) => setValue("diagnosticoOtro", value)}
                  placeholder="Describa el diagnóstico optométrico complementario"
                />
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Paso 6: Prescripción ────────────────────────────── */}
        <TabsContent value="prescripcion" forceMount className="mt-0 data-[state=inactive]:hidden">
          <div className="surface-card overflow-hidden">
            <SectionCardHeader
              code="06"
              title={step.title}
              description={step.description}
              icon={Glasses}
            />
            <div className="space-y-5 p-4 sm:p-5">
              <div>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                  Fórmula de Prescripción Optométrica (RX Final)
                </p>
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <table className="w-full border-collapse">
                    <thead className="bg-secondary text-white">
                      <tr className="divide-x divide-white/10">
                        <EyeHeader>Parámetro Óptico</EyeHeader>
                        <EyeHeader align="center">Ojo Derecho (OD)</EyeHeader>
                        <EyeHeader align="center">Ojo Izquierdo (OI)</EyeHeader>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {RX_FILAS.map((fila) => (
                        <tr
                          key={fila.label}
                          className="divide-x divide-slate-200 transition-colors hover:bg-slate-50/80"
                        >
                          <td className="bg-slate-50/50 px-3 py-2 text-[12px] font-semibold text-ink">
                            {fila.label}
                          </td>
                          <td className="p-1.5">
                            <Input
                              name={fila.od}
                              value={form[fila.od]}
                              onChange={(event) => setValue(fila.od, event.target.value)}
                              placeholder={fila.placeholder}
                              aria-label={`${fila.label} OD`}
                              className="h-8 text-center font-mono text-[12.5px] font-medium tabular-nums"
                            />
                          </td>
                          <td className="p-1.5">
                            <Input
                              name={fila.oi}
                              value={form[fila.oi]}
                              onChange={(event) => setValue(fila.oi, event.target.value)}
                              placeholder={fila.placeholder}
                              aria-label={`${fila.label} OI`}
                              className="h-8 text-center font-mono text-[12.5px] font-medium tabular-nums"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3.5">
                  <p className="border-b border-slate-200 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    Tipo de lente recomendado
                  </p>
                  <div className="mt-2.5">
                    <CheckboxGrid
                      name="tipoLenteRecomendado"
                      options={TIPOS_LENTE}
                      selected={form.tipoLenteRecomendado}
                      onToggle={(value) =>
                        setValue(
                          "tipoLenteRecomendado",
                          toggleInList(form.tipoLenteRecomendado, value),
                        )
                      }
                      columns="grid-cols-1 sm:grid-cols-2"
                    />
                  </div>
                  {form.tipoLenteRecomendado.includes("Otro") && (
                    <OtrosInput
                      name="tipoLenteOtro"
                      value={form.tipoLenteOtro}
                      onChange={(value) => setValue("tipoLenteOtro", value)}
                      placeholder="Especifique diseño de lente"
                    />
                  )}
                </div>

                <div className="rounded-md border border-slate-200 bg-slate-50/40 p-3.5">
                  <p className="border-b border-slate-200 pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
                    Tratamientos o protecciones
                  </p>
                  <div className="mt-2.5">
                    <CheckboxGrid
                      name="tratamientosRecomendados"
                      options={TRATAMIENTOS}
                      selected={form.tratamientosRecomendados}
                      onToggle={(value) =>
                        setValue(
                          "tratamientosRecomendados",
                          toggleInList(form.tratamientosRecomendados, value),
                        )
                      }
                      columns="grid-cols-1 sm:grid-cols-2"
                    />
                  </div>
                  {form.tratamientosRecomendados.includes("Otro") && (
                    <OtrosInput
                      name="tratamientoOtro"
                      value={form.tratamientoOtro}
                      onChange={(value) => setValue("tratamientoOtro", value)}
                      placeholder="Especifique tratamiento o filtro"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Barra inferior de control clínico */}
      <div className="sticky bottom-3 z-10 flex items-center justify-between gap-2 rounded-lg border border-slate-300 bg-white/95 px-3.5 py-2.5 shadow-lift backdrop-blur-sm sm:px-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={prev}
          disabled={index === 0}
          className="px-3"
          title="Etapa anterior"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </Button>

        <div className="flex items-center gap-2.5">
          <span className="hidden font-mono text-[10.5px] font-semibold uppercase tracking-wider text-ink-subtle sm:block">
            SECCIÓN 0{index + 1} / 0{STEPS.length}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={next}
            disabled={index === STEPS.length - 1}
            className="px-3"
            title="Siguiente etapa"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <SubmitButton
            variant="accent"
            size="sm"
            className="h-8.5 px-3.5 text-xs font-semibold"
            pendingLabel="Guardando…"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="sm:hidden">Guardar</span>
            <span className="hidden sm:inline">
              {historia ? "Actualizar Historia" : "Guardar Historia Clínica"}
            </span>
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}