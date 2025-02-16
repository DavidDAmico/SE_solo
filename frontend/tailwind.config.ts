import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Dark Mode wird über die Klasse "dark" aktiviert
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
        darkBackground: "#0a0a0a", // Standard Dark Mode Hintergrund
        darkForeground: "#ededed", // Standard Dark Mode Textfarbe
      },
    },
  },
  plugins: [],
};

export default config;
