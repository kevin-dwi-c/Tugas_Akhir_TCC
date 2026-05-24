/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pmi: {
          50: "#fff1f2",
          100: "#ffe4e6",
          600: "#dc2626",
          700: "#b91c1c",
          900: "#7f1d1d",
        },
      },
      boxShadow: {
        panel: "0 12px 30px rgba(31, 41, 55, 0.08)",
      },
    },
  },
  plugins: [],
};
