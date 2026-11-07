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
        background: "#090B0E",
        surface: "#11151C",
        "surface-elevated": "#181D26",
        "surface-hover": "#202632",
        border: "#232A36",
        "border-focus": "#3B82F6",
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
          DEFAULT: "#8B5CF6",
          subtle: "rgba(139, 92, 246, 0.12)",
          border: "#4C1D95"
        }
      },
      fontFamily: {
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      }
    },
  },
  plugins: [],
}
