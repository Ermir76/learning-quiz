/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['Lora', 'serif'],
        sans: ['InterVariable', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Modern accent palette
        accent: {
          DEFAULT: '#6366F1', // indigo-500 baseline
          soft: '#818CF8',
          strong: '#4F46E5',
          neon: '#7B5CFF'
        },
        surface: {
          50: '#0F1115',
          100: '#161B22',
          200: '#1E2530',
          300: '#273140',
          400: '#303C4E',
          500: '#3A475B',
        },
        positive: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444'
      },
      boxShadow: {
        'elevated': '0 4px 16px -2px rgba(0,0,0,0.4), 0 2px 4px -1px rgba(0,0,0,0.3)',
        'glow': '0 0 0 1px rgba(99,102,241,0.4), 0 4px 24px -4px rgba(99,102,241,0.5)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(circle at 30% 30%, rgba(99,102,241,0.15), transparent 60%)',
        'gradient-glow': 'linear-gradient(135deg,#312e81 0%,#1e1b4b 40%,#0f172a 100%)'
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pulse-soft': { '0%,100%': { opacity: 1 }, '50%': { opacity: .55 } },
        'scale-in': { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } }
      },
      animation: {
        'fade-in': 'fade-in .5s ease-out both',
        'pulse-soft': 'pulse-soft 3s ease-in-out infinite',
        'scale-in': 'scale-in .4s cubic-bezier(.4,.8,.4,1) both'
      },
      transitionTimingFunction: {
        'emphasized': 'cubic-bezier(.4,0,.2,1)',
      }
    }
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};