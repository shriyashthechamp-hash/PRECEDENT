/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090D",
        "bg-secondary": "#0D0F15",
        surface: "#111319",
        "surface-elevated": "#181D26",
        "surface-hover": "#202632",
        border: "rgba(255, 255, 255, 0.09)",
        "border-focus": "#7965FF",
        "text-primary": "#F5F5F7",
        "text-secondary": "#9295A1",
        aurora: {
          violet: "#7965FF",
          "violet-glow": "rgba(121, 101, 255, 0.15)",
          teal: "#00C9B7",
          "teal-glow": "rgba(0, 201, 183, 0.15)",
        },
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
        },
        conflict: {
          DEFAULT: "#EF4444",
          subtle: "rgba(239, 68, 68, 0.12)",
          border: "#7F1D1D"
        },
        memory: {
          DEFAULT: "#7965FF",
          subtle: "rgba(121, 101, 255, 0.12)",
          border: "rgba(121, 101, 255, 0.3)"
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
}

