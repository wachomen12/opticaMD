import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-primary-50 text-primary-700 ring-primary-600/15",
        secondary: "bg-slate-100 text-slate-700 ring-slate-500/15",
        accent: "bg-accent-50 text-accent-700 ring-accent-600/20",
        success: "bg-success-soft text-emerald-700 ring-emerald-600/15",
        warning: "bg-warning-soft text-amber-700 ring-amber-600/15",
        danger: "bg-danger-soft text-red-700 ring-red-600/15",
        outline: "bg-white text-ink-muted ring-slate-200",
        navy: "bg-secondary-50 text-secondary-800 ring-secondary-700/15",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
