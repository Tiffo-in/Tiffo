/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#fdbba7',
          DEFAULT: '#f97316', // Orange-500
          dark: '#c2410c',
        },
        secondary: {
          DEFAULT: '#10b981', // Emerald-500
        }
      }
    },
  },
  plugins: [],
}
