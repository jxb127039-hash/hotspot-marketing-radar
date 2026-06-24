import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18202f",
        paper: "#f6f3ee",
        line: "#ded8cc",
        jd: "#d71920",
        action: "#126d63",
        caution: "#9a5b11"
      },
      boxShadow: {
        panel: "0 16px 48px rgba(24, 32, 47, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
