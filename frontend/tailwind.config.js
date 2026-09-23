/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Cinzel'", "'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      colors: {
        kuchi: {
          bg: "#060913",
          card: "rgba(15, 23, 42, 0.65)",
          border: "rgba(255, 255, 255, 0.12)",
          accent: "#38bdf8",
          gold: "#f59e0b",
          coral: "#f43f5e",
          emerald: "#10b981",
          violet: "#a855f7"
        },
        joint: {
          thumb: "#06b6d4",    // Cyan
          index: "#10b981",    // Emerald
          middle: "#8b5cf6",   // Violet
          ring: "#ec4899",     // Pink
          pinky: "#f97316",    // Orange
          wrist: "#eab308"     // Yellow
        }
      },
      animation: {
        "orb-slow": "orbMove 18s ease-in-out infinite alternate",
        "orb-reverse": "orbMoveReverse 22s ease-in-out infinite alternate",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
        "ping-slow": "ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite",
        "tick": "tickPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
      },
      keyframes: {
        orbMove: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "50%": { transform: "translate(120px, 80px) scale(1.15)" },
          "100%": { transform: "translate(-80px, 140px) scale(0.9)" }
        },
        orbMoveReverse: {
          "0%": { transform: "translate(0px, 0px) scale(1.1)" },
          "50%": { transform: "translate(-140px, -60px) scale(0.85)" },
          "100%": { transform: "translate(90px, -100px) scale(1.05)" }
        },
        pulseSubtle: {
          "0%, 100%": { opacity: 0.8 },
          "50%": { opacity: 1.0 }
        },
        tickPop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)" }
        }
      }
    },
  },
  plugins: [],
}
