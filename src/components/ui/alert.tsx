import * as React from "react";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  info: {
    wrap: "border-primary-100 bg-primary-50/70 text-primary-800",
    icon: Info,
    iconClass: "text-primary",
  },
  success: {
    wrap: "border-emerald-100 bg-success-soft text-emerald-800",
    icon: CheckCircle2,
    iconClass: "text-emerald-600",
  },
  error: {
    wrap: "border-red-100 bg-danger-soft text-red-800",
    icon: AlertCircle,
    iconClass: "text-red-500",
  },
  warning: {
    wrap: "border-amber-100 bg-warning-soft text-amber-900",
    icon: TriangleAlert,
    iconClass: "text-amber-600",
  },
} as const;

export function Alert({
  variant = "info",
  title,
  children,
  className,
}: {
  variant?: keyof typeof styles;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const style = styles[variant];
  const Icon = style.icon;
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[12.5px] leading-relaxed",
        style.wrap,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.iconClass)} />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
