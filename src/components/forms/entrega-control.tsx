"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { actualizarEntrega } from "@/app/actions/contabilidad";
import { ESTADO_ENTREGA_LABEL, ESTADO_ENTREGA_STYLE } from "@/lib/constants";
import type { EstadoEntrega } from "@/lib/types";
import { cn } from "@/lib/utils";

export function EntregaControl({
  ventaId,
  estado,
}: {
  ventaId: string;
  estado: EstadoEntrega;
}) {
  const [value, setValue] = useState<EstadoEntrega>(estado);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function update(next: EstadoEntrega) {
    const previous = value;
    setValue(next);
    setSaved(false);
    startTransition(async () => {
      const result = await actualizarEntrega(ventaId, next);
      if (!result.ok) {
        setValue(previous);
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 1400);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <select
        value={value}
        disabled={pending}
        onChange={(event) => update(event.target.value as EstadoEntrega)}
        aria-label="Estado de entrega"
        className={cn(
          "cursor-pointer appearance-none rounded-full px-2.5 py-1 text-[10px] font-semibold ring-1 ring-inset outline-none transition-opacity focus:ring-2 focus:ring-primary/30",
          ESTADO_ENTREGA_STYLE[value],
          pending && "opacity-60",
        )}
      >
        {(Object.entries(ESTADO_ENTREGA_LABEL) as Array<[EstadoEntrega, string]>).map(
          ([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ),
        )}
      </select>
      {saved && <Check className="h-3 w-3 text-emerald-500 animate-fade-in" />}
    </div>
  );
}
