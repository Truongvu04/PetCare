/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#20df6c",
        "background-light": "#f6f8f7",
        "background-dark": "#112117",
      },
      fontFamily: {
        display: ["Epilogue", "Space Grotesk", "Lexend", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "1rem",
        xl: "1.5rem",
        "2xl": "2rem",
        "3xl": "3rem",
        full: "9999px",
      },
    },
  },
  plugins: [],
}
