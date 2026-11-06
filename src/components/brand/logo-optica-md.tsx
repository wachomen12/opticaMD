"use client";

import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

/**
 * Logo oficial de ÓPTICA MD.
 *
 * Carga `/logo-optica-md.png` por defecto sin parpadeos (flash).
 * - Cuando `tone="light"` (sobre fondos oscuros como el Sidebar #123568),
 *   aplica una cápsula blanca clínica para garantizar contraste perfecto
 *   del texto azul (#235D92) y naranja (#EA711B) del logo original.
 * - Cuando `collapsed={true}`, encuadra el isotipo del ojo del logo.
 */
export function LogoOpticaMD({
  collapsed = false,
  tone = "light",
  className,
  imgClassName,
}: {
  collapsed?: boolean;
  tone?: "light" | "dark";
  className?: string;
  imgClassName?: string;
}) {
  const [errorCarga, setErrorCarga] = useState(false);

  if (errorCarga) {
    return <Logo collapsed={collapsed} tone={tone} className={className} />;
  }

  return (
    <div
      className={cn(
        "inline-flex w-fit items-center select-none",
        tone === "light" &&
          "rounded-md bg-white px-2.5 py-1.5 shadow-xs ring-1 ring-white/15",
        collapsed && "justify-center overflow-hidden p-1.5",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-optica-md.png"
        alt="ÓPTICA MD · Vemos por ti, cuidamos tu visión"
        onError={() => setErrorCarga(true)}
        className={cn(
          " transition-all duration-150",
          collapsed
            ? "h-7 w-7 object-cover object-left" // Encuadra el isotipo del ojo al colapsar
            : "h-9 w-auto max-w-[185px] object-contain",
          imgClassName,
        )}
      />
    </div>
  );
}