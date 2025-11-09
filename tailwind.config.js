/** @type {import('tailwindcss').Config} */
export default {
  // Esta é a parte importante:
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}