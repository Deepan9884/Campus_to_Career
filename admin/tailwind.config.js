/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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
