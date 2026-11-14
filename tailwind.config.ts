import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic Surface Tokens
        canvas: "rgb(var(--surface-canvas) / <alpha-value>)",
        elevated: "rgb(var(--surface-elevated) / <alpha-value>)",
        subtle: "rgb(var(--surface-subtle) / <alpha-value>)",
        inset: "rgb(var(--surface-inset) / <alpha-value>)",
        hover: "rgb(var(--surface-hover) / <alpha-value>)",

        // Semantic Typography / Ink Tokens
        ink: {
          DEFAULT: "rgb(var(--ink-primary) / <alpha-value>)",
          secondary: "rgb(var(--ink-secondary) / <alpha-value>)",
          muted: "rgb(var(--ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--ink-subtle) / <alpha-value>)",
        },

        // Semantic Hairline / Border Tokens
        line: {
          subtle: "var(--line-subtle)",
          DEFAULT: "var(--line-default)",
          strong: "var(--line-strong)",
        },

        // Unified Brand Accent Tokens
        accent: {
          DEFAULT: "rgb(var(--accent-primary) / <alpha-value>)",
          hover: "rgb(var(--accent-primary-hover) / <alpha-value>)",
          ink: "rgb(var(--accent-ink) / <alpha-value>)",
          soft: "var(--accent-soft)",
          border: "var(--accent-border)",
          foreground: "#FFFFFF",
        },

        // Semantic Status Tokens
        success: {
          DEFAULT: "var(--status-success-ink)",
          soft: "var(--status-success-bg)",
          border: "var(--status-success-border)",
        },
        warning: {
          DEFAULT: "var(--status-warning-ink)",
          soft: "var(--status-warning-bg)",
          border: "var(--status-warning-border)",
        },
        danger: {
          DEFAULT: "var(--status-danger-ink)",
          soft: "var(--status-danger-bg)",
          border: "var(--status-danger-border)",
        },
        info: {
          DEFAULT: "var(--status-info-ink)",
          soft: "var(--status-info-bg)",
          border: "var(--status-info-border)",
        },

        // Legacy Brand Ramp (kept for compatibility)
        brand: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A",
          accent: "#06B6D4",
        },
        status: {
          verified: "#10B981",
          warning: "#F59E0B",
          mismatch: "#EF4444",
          unverified: "#94A3B8",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        fintech: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)",
        elevated: "0 10px 25px -5px rgba(11, 17, 32, 0.1), 0 8px 10px -6px rgba(11, 17, 32, 0.1)",
        surface: "var(--shadow-card)",
        popover: "var(--shadow-popover)",
      },
    },
  },
  plugins: [],
};

export default config;
