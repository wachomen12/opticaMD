import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white shadow-sm shadow-primary/20 hover:bg-primary-700 active:translate-y-px",
        accent:
          "bg-accent text-white shadow-sm shadow-accent/25 hover:bg-accent-600 active:translate-y-px",
        secondary:
          "bg-secondary text-white shadow-sm shadow-secondary/20 hover:bg-secondary-800 active:translate-y-px",
        outline:
          "border border-slate-200 bg-white text-ink shadow-xs hover:border-slate-300 hover:bg-slate-50 active:translate-y-px",
        ghost: "text-ink-muted hover:bg-slate-100 hover:text-ink",
        subtle: "bg-primary-50 text-primary-700 hover:bg-primary-100",
        success: "bg-success text-white hover:bg-emerald-700",
        destructive: "bg-danger text-white shadow-sm hover:bg-red-700",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-5 text-[15px]",
        icon: "h-9 w-9",
        "icon-sm": "h-8 w-8 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
