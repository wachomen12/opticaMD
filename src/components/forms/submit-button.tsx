"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SubmitButton({
  children,
  pendingLabel = "Procesando…",
  disabled,
  className,
  ...props
}: ButtonProps & { pendingLabel?: string }) {
  const { pending } = useFormStatus();
  const isDisabled = Boolean(disabled || pending);

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      aria-busy={pending}
      className={cn(
        "relative select-none gap-2 rounded-md font-medium tracking-tight transition-all duration-150",
        pending && "cursor-wait opacity-90",
        className,
      )}
      {...props}
    >
      {pending ? (
        <>
          <Loader2
            className="h-3.5 w-3.5 shrink-0 animate-spin"
            strokeWidth={2.2}
          />
          <span className="font-mono text-[11.5px] tracking-normal">
            {pendingLabel}
          </span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}