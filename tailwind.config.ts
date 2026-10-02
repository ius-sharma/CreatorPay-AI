import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f8f5ff",
          100: "#efe9ff",
          200: "#ddceff",
          300: "#c4a8ff",
          400: "#a57aff",
          500: "#8954ff",
          600: "#7033ff", // Core user brand color
          700: "#5b22dc",
          800: "#481bb2",
          900: "#39168f",
          950: "#220963",
        },
        paypal: {
          gold: "#ffc439",
          goldDark: "#e5ad2a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
