/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        titan: {
          bg: '#0a0e17',
          card: '#111827',
          surface: '#1e293b',
          border: '#334155',
          accent: '#10b981',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          danger: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
