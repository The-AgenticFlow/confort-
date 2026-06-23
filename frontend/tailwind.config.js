/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'arcade-black': '#0A0A0A',
        'neon-cyan': '#00FFCC',
      },
      fontFamily: {
        'space': ['Space Grotesk', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 15px rgba(0, 255, 204, 0.4)',
        'neon-lg': '0 0 25px rgba(0, 255, 204, 0.5)',
      },
      animation: {
        'grid-scroll': 'gridScroll 20s linear infinite',
      },
      keyframes: {
        gridScroll: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' },
        },
      },
    },
  },
  plugins: [],
}
