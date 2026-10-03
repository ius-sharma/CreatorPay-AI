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
          600: "#7033ff", // Core User Brand Violet
          700: "#5b22dc",
          800: "#481bb2",
          900: "#39168f",
          950: "#220963",
        },
        paypal: {
          blue: "#003087",      // Official Primary PayPal Blue
          bright: "#0079C1",    // Official PayPal Action Blue
          navy: "#001C3E",      // Official PayPal Navy
          gold: "#FFC439",      // Official PayPal Checkout Gold
          goldDark: "#E5AD2A",
          surface: "#F5F7FA",
          border: "#EAECF0",
        },
        accent: {
          indigo: "#635bff",
          cyan: "#00b8d9",
          coral: "#ff7a59",
        },
      },
      fontFamily: {
        sans: ["var(--font-instrument-sans)", "Instrument Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
