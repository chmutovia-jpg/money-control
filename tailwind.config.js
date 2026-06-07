/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 24px 70px rgba(0, 0, 0, 0.42)",
        card: "0 18px 44px rgba(0, 0, 0, 0.28)",
      },
      borderRadius: {
        "5xl": "24px",
      },
      colors: {
        ink: "#F4F7FB",
        muted: "#9AA6B8",
        surface: "#010308",
      },
    },
  },
  plugins: [],
};
