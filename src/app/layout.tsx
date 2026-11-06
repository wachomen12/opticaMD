import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "ÓPTICA MD · Sistema Clínico y Contable",
    template: "%s · ÓPTICA MD",
  },
  description:
    "Vemos por ti, cuidamos tu visión. Sistema integral de gestión optométrica, órdenes de laboratorio y control contable para ÓPTICA MD.",
  applicationName: "ÓPTICA MD",
  authors: [{ name: "ÓPTICA MD" }],
  keywords: ["óptica", "optometría", "historial clínico", "contabilidad", "Ecuador"],
};

export const viewport: Viewport = {
  themeColor: "#123568",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${jakarta.variable} ${plex.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-canvas font-sans text-ink antialiased selection:bg-primary/15 selection:text-primary-900 [font-feature-settings:'cv02','cv03','cv04','cv11','tnum']">
        {children}
      </body>
    </html>
  );
}