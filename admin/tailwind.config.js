/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        border: "rgba(255, 255, 255, 0.1)",
        background: "#020617",
        foreground: "#f8fafc",
        muted: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "#94a3b8",
        },
      },
    },
  },
  plugins: [],
};
