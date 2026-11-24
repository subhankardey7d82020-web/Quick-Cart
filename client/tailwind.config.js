/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF7F0',
          200: '#F4EFE6',
          300: '#EBE3D5',
        },
        noir: {
          900: '#111111',
          800: '#1A1A1A',
          700: '#262626',
        },
        accent: {
          DEFAULT: '#9A7B38',
          hover: '#82662B',
          light: '#F8F4EC',
          gold: '#C5A869',
        },
        sand: {
          100: '#F2EDE4',
          200: '#E5DDCF',
          300: '#C7BBA5',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        widest: '.2em',
        luxury: '.15em',
      },
    },
  },
  plugins: [],
}
