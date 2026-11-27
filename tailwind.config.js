/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, cozy "tavern at night" palette
        // night/parchment are theme-aware CSS variables (swapped in light mode, see index.css)
        night: {
          950: 'rgb(var(--night-950) / <alpha-value>)',
          900: 'rgb(var(--night-900) / <alpha-value>)',
          800: 'rgb(var(--night-800) / <alpha-value>)',
          700: 'rgb(var(--night-700) / <alpha-value>)',
          600: 'rgb(var(--night-600) / <alpha-value>)',
        },
        ember: { 300: '#ffd08a', 400: '#ffb454', 500: '#ff8c3a', 600: '#e8642a' },
        parchment: {
          100: 'rgb(var(--parchment-100) / <alpha-value>)',
          200: 'rgb(var(--parchment-200) / <alpha-value>)',
          300: 'rgb(var(--parchment-300) / <alpha-value>)',
          400: 'rgb(var(--parchment-400) / <alpha-value>)',
        },
        moss: '#8bc47a',
        sky: '#7fb8e6',
        rose: '#f28fa6',
        violet: '#b49af0',
      },
      fontFamily: {
        pixel: ['"Pixelify Sans"', 'system-ui', 'sans-serif'],
        sans: ['Nunito', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pixel: '0 4px 0 0 rgba(0,0,0,0.35)',
        'pixel-sm': '0 2px 0 0 rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
};
