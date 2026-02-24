/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        vinyl: {
          bg: '#07090F',
          surface: '#0E1220',
          card: '#141826',
          border: '#1E2538',
          gold: '#C8A876',
          amber: '#E8833A',
          rose: '#E84A6F',
          teal: '#3ABFBF',
          text: '#F2EDE4',
          muted: '#6B7385',
          faint: '#2A3045',
        },
      },
      keyframes: {
        spin_slow: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        pulse_glow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        slide_up: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fade_in: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        swipe_left: {
          to: { opacity: '0', transform: 'translateX(-120%) rotate(-15deg)' },
        },
        swipe_right: {
          to: { opacity: '0', transform: 'translateX(120%) rotate(15deg)' },
        },
        bar_grow: {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        wave: {
          '0%, 100%': { height: '4px' },
          '50%': { height: '20px' },
        },
      },
      animation: {
        spin_slow: 'spin_slow 12s linear infinite',
        spin_vslow: 'spin_slow 24s linear infinite',
        pulse_glow: 'pulse_glow 3s ease-in-out infinite',
        slide_up: 'slide_up 0.5s ease-out forwards',
        fade_in: 'fade_in 0.4s ease-out forwards',
        swipe_left: 'swipe_left 0.45s ease-in forwards',
        swipe_right: 'swipe_right 0.45s ease-in forwards',
        float: 'float 6s ease-in-out infinite',
        wave: 'wave 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
