import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        valo: {
          red: "#ff4655",
          dark: "#0a0e14",
          panel: "#141b23",
          panel2: "#0f151c",
          line: "#243039",
          cyan: "#22d3ee",
          yellow: "#facc15",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
