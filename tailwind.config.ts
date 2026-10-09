import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
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
          50: "#fdf7f5",
          100: "#fceee9",
          200: "#f9d8ce",
          300: "#f4b7a4",
          400: "#ee8b6d",
          500: "#ea5834", // Core Terracotta Coral
          600: "#d84723",
          700: "#b53517",
          800: "#8f2a14",
          900: "#6f2212",
          950: "#3e0f07",
        },
        espresso: {
          50: "#faf6f4",
          100: "#f4ebe6",
          200: "#e8d8d0",
          300: "#d6bdb2",
          400: "#bda093",
          500: "#9e8174",
          600: "#7d6357",
          700: "#5e483e",
          800: "#43322a",
          900: "#2b1d19", // Primary Deep Warm Neutral
          950: "#17100e", // Deep Dark Surface
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
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
