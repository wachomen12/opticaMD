import { AppShell } from "@/components/layout/app-shell";
import { getDataset } from "@/lib/data";
import { MESES } from "@/lib/constants";

// Todas las páginas de la aplicación dependen de PostgreSQL y de la sesión:
// se renderizan en cada petición, nunca durante el build.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const dataset = await getDataset();
  const enTaller = dataset.ventas.filter((v) => v.estadoEntrega !== "ENTREGADO").length;
  const pacientes = dataset.pacientes.filter((p) => p.activo).length;
  const hoy = new Date();
  const todayLabel = `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;

  return (
    <AppShell
      enTaller={enTaller}
      pacientes={pacientes}
      todayLabel={todayLabel}
    >
      {children}
    </AppShell>
  );
}
