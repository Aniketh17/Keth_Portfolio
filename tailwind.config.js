/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Channel variables (see index.css) so opacity modifiers like text-canvas/80 work.
        blueberry: 'rgb(var(--blueberry-rgb) / <alpha-value>)',
        soda: 'rgb(var(--pop-soda-rgb) / <alpha-value>)',
        canvas: 'rgb(var(--canvas-rgb) / <alpha-value>)',
        paper: 'rgb(var(--paper-rgb) / <alpha-value>)',
        line: 'var(--line)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        sans: ['Switzer', 'system-ui', 'sans-serif'],
        mono: ["'Geist Mono'", 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
