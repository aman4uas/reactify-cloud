/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'move-left': {
          '0%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-2px)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        'move-left': 'move-left 1000ms linear infinite',
      },
    },
  },
  plugins: [],
}

