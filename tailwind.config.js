/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'selector', // supports class="dark" on <html>
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#23273C',
          dark: '#23273C',
          light: '#2E334D',
        },
        accent: {
          DEFAULT: '#3EC3D5',
          hover: '#36B2C3',
          active: '#2799A8',
          light: 'rgba(62, 195, 213, 0.1)',
        },
        secondary: {
          DEFAULT: '#3EC3D5',
          dark: '#3EC3D5',
        },
        success: {
          DEFAULT: '#41DC65',
          light: 'rgba(65, 220, 101, 0.1)',
        },
        danger: {
          DEFAULT: '#FF5460',
          light: 'rgba(255, 84, 96, 0.1)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: 'rgba(245, 158, 11, 0.1)',
        },
        info: {
          DEFAULT: '#3EC3D5',
        },
        slatebg: {
          light: '#F7F7FA',
          dark: '#161824',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#23273C',
        },
        divider: {
          light: '#E1E0E6',
          dark: '#2D324B',
        },
        muted: {
          DEFAULT: '#C8C7CD',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(35, 39, 60, 0.07)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
