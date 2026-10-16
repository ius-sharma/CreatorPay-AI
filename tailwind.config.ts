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
          50: "#F3F6FF",
          100: "#EAF0FF",
          200: "#D5E1FF",
          300: "#B6CCFF",
          400: "#9AB8FF",
          500: "#4778EB",
          600: "#2457D6",
          700: "#1B43AD",
          800: "#193B8A",
          900: "#142F69",
          950: "#101F3E",
        },
        espresso: {
          50: "#F5F7FA",
          100: "#EDF1F7",
          200: "#DCE3EC",
          300: "#BFCBDD",
          400: "#A9B7CC",
          500: "#7C8DA6",
          600: "#5D6B80",
          700: "#344258",
          800: "#202D40",
          900: "#172130",
          950: "#101722",
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
        mono: ["var(--font-jakarta)", "Plus Jakarta Sans", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
