/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fee2e2',
          100: '#fecaca',
          200: '#fca5a5',
          300: '#f87171',
          400: '#f05252',
          500: '#dc2626',  // Color rojo principal
          600: '#c81e1e',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        corporate: {
          red: '#dc2626',
          darkred: '#991b1b',
          lightred: '#fee2e2',
        }
      },
      fontFamily: {
        sans: ['Santander', 'Santander Text', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
