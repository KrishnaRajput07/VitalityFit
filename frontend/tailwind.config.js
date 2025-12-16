/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fafaf9", // Warm gray/cream
        surface: "#ffffff",
        primary: "#bef264",    // Lime 300
        primaryDark: "#a3e635", // Lime 400
        secondary: "#15803d",  // Green 700
        accent: "#84cc16",     // Lime 500
        text: "#1c1917",       // Stone 900
        muted: "#78716c",      // Stone 500
        ok: "#22c55e",
        warn: "#f59e0b",
        warn: "#f59e0b",
        bad: "#ef4444",
        pink: "#ec4899", // Pink 500 - The "slight pink" requested
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      animation: {
        marquee: 'marquee 25s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        }
      }
    },
  },
  plugins: [],
}
