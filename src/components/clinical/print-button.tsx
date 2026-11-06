"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PrintButton({
  label = "Imprimir / Guardar PDF",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      className={cn(
        "no-print group h-8 gap-2 rounded-md border-slate-300 bg-white px-3 text-[12px] font-medium text-ink shadow-xs transition-colors hover:border-primary hover:bg-primary-50/50 hover:text-primary",
        className,
      )}
    >
      <Printer
        className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-105"
        strokeWidth={1.85}
      />
      <span>{label}</span>
      <kbd className="ml-0.5 hidden rounded border border-slate-200 bg-slate-50 px-1 py-0.5 font-mono text-[9px] font-medium text-slate-400 group-hover:border-primary-200 group-hover:bg-white group-hover:text-primary sm:inline-block">
        Ctrl+P
      </kbd>
    </Button>
  );
}