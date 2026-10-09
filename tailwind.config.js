/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#111426',
        night2: '#181C36',
        night3: '#222750',
        violet: { DEFAULT: '#7568FF', soft: '#B0A8FF', deep: '#4A3FD0' },
        citron: '#D9F477',
        ivory: { DEFAULT: '#F6F0E6', dim: '#E9E1D2' },
        peach: '#FF9678',
        ink: '#1A1D33',
      },
      fontFamily: {
        display: ["'Fraunces'", 'Georgia', 'serif'],
        sans: ["'Instrument Sans'", 'system-ui', 'sans-serif'],
        mono: ["'JetBrains Mono'", 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
