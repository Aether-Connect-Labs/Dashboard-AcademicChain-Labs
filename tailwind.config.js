/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#0f172a",
          100: "#0b1220",
          200: "#0b1732",
          300: "#0e2a47",
          400: "#0f4c81",
          500: "#0891b2",
          600: "#06b6d4",
          700: "#0ea5e9",
          800: "#0369a1",
          900: "#0b1120",
        },
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15,23,42,0.65)",
      },
    },
  },
  plugins: [],
};
