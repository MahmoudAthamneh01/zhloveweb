/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ZH-Love custom colors
        'tactical-green': {
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
          DEFAULT: '#22c55e',
        },
        'victory-gold': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          DEFAULT: '#f59e0b',
        },
        'command-blue': {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: '#3b82f6',
        },
        'alert-red': {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          DEFAULT: '#ef4444',
        },
        'neutral-silver': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          DEFAULT: '#64748b',
        },
        'gunmetal-gray': {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          DEFAULT: '#334155',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'Avenir',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        arabic: [
          'var(--font-arabic)',
          'Bahij TheSansArabic',
          'Tahoma',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'Liberation Mono',
          'Courier New',
          'monospace',
        ],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'military-pattern': "url('data:image/svg+xml,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23334155\" fill-opacity=\"0.1\"><polygon points=\"30,0 60,30 30,60 0,30\"/></g></g></svg>')",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.5s ease-in-out',
        'fade-in-down': 'fadeInDown 0.5s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-in-out',
        'slide-out': 'slideOut 0.3s ease-in-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOut: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'military': '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-gold': '0 0 20px rgba(245, 158, 11, 0.5)',
      },
      backdropBlur: {
        xs: '2px',
      },
      zIndex: {
        '100': '100',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    // Custom plugin for RTL support
    function({ addUtilities, addComponents, theme }) {
      const newUtilities = {
        '.rtl': {
          direction: 'rtl',
        },
        '.ltr': {
          direction: 'ltr',
        },
        '.text-gradient': {
          'background': 'linear-gradient(135deg, theme("colors.tactical-green.500"), theme("colors.victory-gold.500"))',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.container-custom': {
          'max-width': '1200px',
          'margin-left': 'auto',
          'margin-right': 'auto',
          'padding-left': '1rem',
          'padding-right': '1rem',
          '@screen sm': {
            'padding-left': '1.5rem',
            'padding-right': '1.5rem',
          },
          '@screen lg': {
            'padding-left': '2rem',
            'padding-right': '2rem',
          },
        },
        '.arabic-text': {
          'font-family': theme('fontFamily.arabic'),
        },
      };

      const newComponents = {
        '.btn': {
          'display': 'inline-flex',
          'align-items': 'center',
          'justify-content': 'center',
          'border-radius': '0.5rem',
          'font-size': '0.875rem',
          'font-weight': '500',
          'transition': 'all 0.2s',
          'cursor': 'pointer',
          'text-decoration': 'none',
          '&:focus': {
            'outline': '2px solid transparent',
            'outline-offset': '2px',
            'box-shadow': '0 0 0 2px theme("colors.ring")',
          },
          '&:disabled': {
            'pointer-events': 'none',
            'opacity': '0.5',
          },
        },
        '.btn-primary': {
          'background-color': 'theme("colors.primary.DEFAULT")',
          'color': 'theme("colors.primary.foreground")',
          'border': '1px solid theme("colors.primary.DEFAULT")',
          '&:hover': {
            'background-color': 'theme("colors.primary.600")',
            'border-color': 'theme("colors.primary.600")',
          },
        },
        '.btn-secondary': {
          'background-color': 'theme("colors.secondary.DEFAULT")',
          'color': 'theme("colors.secondary.foreground")',
          'border': '1px solid theme("colors.secondary.DEFAULT")',
          '&:hover': {
            'background-color': 'theme("colors.secondary.600")',
          },
        },
        '.btn-outline': {
          'background-color': 'transparent',
          'color': 'theme("colors.foreground")',
          'border': '1px solid theme("colors.border")',
          '&:hover': {
            'background-color': 'theme("colors.accent.DEFAULT")',
            'color': 'theme("colors.accent.foreground")',
          },
        },
        '.btn-ghost': {
          'background-color': 'transparent',
          'color': 'theme("colors.foreground")',
          'border': '1px solid transparent',
          '&:hover': {
            'background-color': 'theme("colors.accent.DEFAULT")',
            'color': 'theme("colors.accent.foreground")',
          },
        },
        '.btn-sm': {
          'height': '2rem',
          'padding-left': '0.75rem',
          'padding-right': '0.75rem',
          'font-size': '0.75rem',
        },
        '.btn-md': {
          'height': '2.5rem',
          'padding-left': '1rem',
          'padding-right': '1rem',
        },
        '.btn-lg': {
          'height': '3rem',
          'padding-left': '1.5rem',
          'padding-right': '1.5rem',
          'font-size': '1rem',
        },
        '.btn-xl': {
          'height': '3.5rem',
          'padding-left': '2rem',
          'padding-right': '2rem',
          'font-size': '1.125rem',
        },
        '.military-card': {
          'background-color': 'theme("colors.card.DEFAULT")',
          'border': '1px solid theme("colors.border")',
          'border-radius': '0.75rem',
          'box-shadow': 'theme("boxShadow.military")',
          'transition': 'all 0.3s ease',
          '&:hover': {
            'box-shadow': 'theme("boxShadow.glow")',
            'transform': 'translateY(-2px)',
          },
        },
        '.hover-lift': {
          'transition': 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            'transform': 'translateY(-4px)',
            'box-shadow': 'theme("boxShadow.xl")',
          },
        },
        '.spinner': {
          'border': '2px solid transparent',
          'border-top': '2px solid currentColor',
          'border-radius': '50%',
          'animation': 'spin 1s linear infinite',
        },
      };

      addUtilities(newUtilities);
      addComponents(newComponents);
    },
  ],
}; 