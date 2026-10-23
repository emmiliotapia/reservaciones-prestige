/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#030712",
        glass: "rgba(11, 15, 25, 0.82)",
        "glass-border": "rgba(255, 255, 255, 0.08)",
        neon: {
          green: "#00FF66",
          glow: "rgba(0, 255, 102, 0.25)"
        },
        status: {
          disponible: "#10b981",
          reservada: "#3b82f6",
          ocupada: "#f43f5e",
          limpieza: "#f59e0b"
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(0, 255, 102, 0.35)',
        'neon-strong': '0 0 30px 2px rgba(0, 255, 102, 0.55)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.5)'
      }
    },
  },
  plugins: [],
}
