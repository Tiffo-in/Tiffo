/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // TIFFO Primary Brand Color (Orange)
        primary: {
          50: '#fff3e8',
          100: '#ffe0c2',
          200: '#ffc085',
          300: '#ffa047',
          400: '#ff8a24',
          500: '#FF7A18', // TIFFO Brand Orange
          600: '#e06514',
          700: '#b84e10',
          800: '#8a3b0d',
          900: '#5c2708',
        },
        // Warm Secondary (Orange from logo)
        secondary: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Warm orange
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Maroon (legacy alias — now points at the brand orange after the
        // rebrand, so any remaining `maroon-*` classes render on-brand).
        maroon: {
          50: '#fff3e8',
          100: '#ffe0c2',
          200: '#ffc085',
          300: '#ffa047',
          400: '#ff8a24',
          500: '#FF7A18',
          600: '#e06514',
          700: '#b84e10',
          800: '#8a3b0d',
          900: '#5c2708',
        },
        // Zomato Red (optional for reference)
        zomato: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#E23744', // Zomato signature red
          600: '#cb202d',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
        // Food-themed Accents
        accent: {
          // Fresh Green (veg indicator)
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534',
            900: '#14532d',
          },
          // Orange (non-veg, hot food)
          orange: {
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
          },
          // Gold (premium, ratings)
          gold: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#fde047',
            400: '#facc15',
            500: '#eab308',
            600: '#ca8a04',
            700: '#a16207',
          },
        },
        // Clean Neutrals (Zomato-style grays)
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        // Utility Colors
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.625rem',
        '3xl': '1.953rem',
        '4xl': '2.441rem',
        '5xl': '3.052rem',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        // Zomato-inspired subtle shadows
        'card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06)',
        'premium': '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
        'premium-lg': '0 20px 60px rgba(0, 0, 0, 0.15), 0 4px 16px rgba(0, 0, 0, 0.1)',
        'glow': '0 0 20px rgba(255, 122, 24, 0.25)',
        'glow-lg': '0 0 40px rgba(255, 122, 24, 0.35)',
        'inner-premium': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF7A18 0%, #e06514 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        'gradient-premium': 'linear-gradient(135deg, #FF7A18 0%, #e06514 50%, #b84e10 100%)',
        'gradient-warm': 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
        'gradient-hero': 'linear-gradient(135deg, #FF7A18 0%, #ff8a24 100%)',
        'gradient-radial': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}