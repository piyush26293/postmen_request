/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        gray: {
          850: '#1f2937',
          900: '#111827',
          950: '#0f0f23'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Monaco', 'Menlo', 'monospace']
      }
    },
  },
  plugins: [],
}