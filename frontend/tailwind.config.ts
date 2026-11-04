import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FDFBF7',
          100: '#F7F4EE',
          200: '#EFE9DE',
          300: '#E7E0D6',
        },
        espresso: {
          900: '#15100E',
          800: '#241C18',
          700: '#352923',
          600: '#4A3B33',
        },
        champagne: {
          DEFAULT: '#C4A779',
          light: '#DBC39E',
          dark: '#A68758',
          subtle: '#F4EFE6',
        },
        stone: {
          light: '#FAF8F5',
          DEFAULT: '#E7E0D6',
          muted: '#CFC6B8',
        },
        charcoal: {
          DEFAULT: '#514A45',
          muted: '#736B65',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        editorial: '0.08em',
        widest: '0.15em',
      },
    },
  },
  plugins: [],
} satisfies Config;
