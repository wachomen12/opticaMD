import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: React.ReactNode;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label
          htmlFor={htmlFor}
          className="text-[11.5px] font-semibold tracking-tight text-ink"
        >
          {label}
          {required && (
            <span
              className="ml-1 font-mono text-[11px] font-bold text-accent"
              title="Campo obligatorio"
            >
              *
            </span>
          )}
        </Label>
        {hint && (
          <span className="font-mono text-[10px] text-ink-subtle">
            {hint}
          </span>
        )}
      </div>

      {children}

      {error && (
        <p
          role="alert"
          className="flex items-center gap-1.5 pt-0.5 text-[11px] font-medium leading-tight text-red-600"
        >
          <AlertCircle className="h-3 w-3 shrink-0 text-red-500" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-3", className)}>
      <div className="border-b border-slate-200/90 pb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-[2.5px] rounded-xs bg-accent" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
            {title}
          </p>
        </div>
        {description && (
          <p className="mt-0.5 text-[11px] leading-snug text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}