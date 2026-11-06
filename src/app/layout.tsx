import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/*
 * Las fuentes se sirven desde el propio proyecto (src/app/fonts).
 * Así el build no depende de descargar Google Fonts, que fallaba de forma
 * intermitente en Vercel al compilar `next/font/google`.
 */
const jakarta = localFont({
  src: [
    { path: "./fonts/plus-jakarta-sans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const plex = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    { path: "./fonts/jetbrains-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/jetbrains-mono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/jetbrains-mono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-mono",
  display: "swap",
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