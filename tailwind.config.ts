import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1480px" },
    },
    extend: {
      colors: {
        // ── Identidad corporativa ÓPTICA MD (Calibración Clínica) ──
        primary: {
          DEFAULT: "#235D92", // Azul corporativo — texto "ÓPTICA" / iris
          50: "#F2F7FB",
          100: "#E1EDF7",
          200: "#C3DDF0",
          300: "#94C2E5",
          400: "#5D9FD6",
          500: "#367FB9",
          600: "#235D92", // principal
          700: "#1D4C78",
          800: "#1B4165",
          900: "#1B3755",
          950: "#112338",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#123568", // Azul marino profundo — sidebar / pupila
          50: "#F0F5FA",
          100: "#DCE7F3",
          200: "#BDD3EB",
          300: "#90B5DD",
          400: "#5D8FCA",
          500: "#3B6FB4",
          600: "#2B5696",
          700: "#23457A",
          800: "#1E3B66",
          900: "#123568", // corporativo
          950: "#0B1E3D",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#EA711B", // Naranja vibrante — "MD" / CTA
          50: "#FEF6EE",
          100: "#FDE9D7",
          200: "#FACFAD",
          300: "#F6AE79",
          400: "#F18843",
          500: "#EA711B", // corporativo
          600: "#D65711",
          700: "#B14110",
          800: "#8E3414",
          900: "#732D14",
          950: "#3E1408",
          foreground: "#FFFFFF",
        },
        // Superficies técnicas de alto contraste y baja fatiga visual
        canvas: "#F4F6F9",
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#0B1324",
          muted: "#475569",
          subtle: "#64748B",
        },
        background: "#F4F6F9",
        foreground: "#0B1324",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0B1324",
        },
        muted: {
          DEFAULT: "#EDF1F7",
          foreground: "#475569",
        },
        border: "#CBD5E1", // Borde más nítido estilo grilla médica/contable
        input: "#CBD5E1",
        ring: "#235D92",
        success: {
          DEFAULT: "#0D8A68",
          soft: "#E6F5F0",
        },
        warning: {
          DEFAULT: "#C86D04",
          soft: "#FEF3E2",
        },
        danger: {
          DEFAULT: "#C92A2A",
          soft: "#FCE8E8",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      // Neutralizamos los bordes "burbuja" de IA por geometría técnica/suiza
      borderRadius: {
        sm: "0.25rem",   // 4px
        DEFAULT: "0.375rem", // 6px
        md: "0.375rem",  // 6px
        lg: "0.5rem",    // 8px
        xl: "0.5rem",    // 8px (antes 14px)
        "2xl": "0.625rem", // 10px (antes 18px)
        "3xl": "0.75rem",  // 12px (antes 24px)
      },
      // Sombras secas de precisión (sin halos difusos exagerados)
      boxShadow: {
        xs: "0 1px 1px 0 rgb(11 19 36 / 0.04)",
        card: "0 1px 2px 0 rgb(11 19 36 / 0.05)",
        lift: "0 4px 12px -2px rgb(18 53 104 / 0.10), 0 2px 4px -2px rgb(11 19 36 / 0.06)",
        "inner-line": "inset 0 1px 0 0 rgb(255 255 255 / 0.08)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "grow-bar": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
        "slide-up": "slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "grow-bar": "grow-bar 0.45s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;