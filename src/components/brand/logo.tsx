import React from "react";
import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  const ring = tone === "light" ? "#9CC8EE" : "#235D92";
  const pupil = tone === "light" ? "#FFFFFF" : "#123568";
  const glow = tone === "light" ? "rgba(156,200,238,0.16)" : "rgba(35,93,146,0.12)";
  return (
    <svg
      viewBox="0 0 48 48"
      role="img"
      aria-label="Logotipo ÓPTICA MD"
      className={cn("h-7 w-7", className)}
    >
      <circle cx="24" cy="21" r="17" fill={glow} />
      <circle cx="24" cy="21" r="14" fill="none" stroke={ring} strokeWidth="2.4" />
      <circle
        cx="24"
        cy="21"
        r="9.5"
        fill="none"
        stroke={ring}
        strokeWidth="1.1"
        opacity="0.55"
      />
      <circle cx="24" cy="21" r="5.1" fill={pupil} />
      <circle cx="21.6" cy="18.6" r="1.7" fill={ring} opacity="0.9" />
      <path
        d="M12.5 39.5c4.2 5.2 18.2 6.2 24.4-.6"
        fill="none"
        stroke="#EA711B"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M19 44.2c3.1 2 9 2 12.2.2"
        fill="none"
        stroke="#EA711B"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function Logo({
  collapsed = false,
  tone = "light",
  className,
}: {
  collapsed?: boolean;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded border",
          tone === "light"
            ? "border-white/15 bg-white/[0.06]"
            : "border-primary-200 bg-primary-50",
        )}
      >
        <BrandMark tone={tone} className="h-6 w-6" />
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <p
            className={cn(
              "font-display text-[16px] font-bold leading-none tracking-tight",
              tone === "light" ? "text-white" : "text-secondary",
            )}
          >
            ÓPTICA <span className="text-accent">MD</span>
          </p>
          <p
            className={cn(
              "mt-1 truncate font-mono text-[8px] font-semibold uppercase leading-none tracking-[0.14em]",
              tone === "light" ? "text-white/50" : "text-ink-subtle",
            )}
          >
            Vemos por ti, cuidamos tu visión
          </p>
        </div>
      )}
    </div>
  );
}