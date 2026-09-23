/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "'Instrument Serif'", "Georgia", "serif"],
        sans: ["'Plus Jakarta Sans'", "sans-serif"],
        display: ["'Outfit'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.9', transform: 'scale(1.04)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.2', transform: 'scale(0.8)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
        }
      },
      animation: {
        floatSlow: 'floatSlow 6s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        twinkle: 'twinkle 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
