import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9A84C",
          light: "#E2C97E",
          dark: "#A8882E",
        },
        charcoal: {
          DEFAULT: "#1C1C1E",
          light: "#2C2C2E",
          muted: "#3A3A3C",
        },
        cream: {
          DEFAULT: "#F5F0E8",
          dark: "#EDE8DC",
        },
        ivory: "#FAFAF8",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201, 168, 76, 0.3)",
        "gold-lg": "0 8px 32px rgba(201, 168, 76, 0.12)",
        premium: "0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        "premium-lg": "0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E2C97E 50%, #A8882E 100%)",
        "dark-gradient": "linear-gradient(135deg, #1C1C1E 0%, #2C2C2E 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
