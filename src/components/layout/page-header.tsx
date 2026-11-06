import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-slate-200/90 pb-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-1 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
            <span className="h-3 w-[3px] rounded-xs bg-accent" />
            {eyebrow}
          </p>
        )}
        <h2 className="text-balance font-display text-[20px] font-semibold leading-snug tracking-tight text-ink sm:text-[22px]">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 max-w-2xl text-[12.5px] leading-normal text-ink-muted">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}