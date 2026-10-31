/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        lime: 'rgb(var(--lime) / <alpha-value>)',
        cyan: 'rgb(var(--cyan) / <alpha-value>)',
        ember: 'rgb(var(--ember) / <alpha-value>)',
        violet: 'rgb(var(--violet) / <alpha-value>)',
      },
      // text-lime etc. use the darker light-mode shades; bg/border keep the bright brand colors
      textColor: {
        lime: 'rgb(var(--lime-text) / <alpha-value>)',
        cyan: 'rgb(var(--cyan-text) / <alpha-value>)',
        ember: 'rgb(var(--ember-text) / <alpha-value>)',
        violet: 'rgb(var(--violet-text) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--lime) / 0.55)',
        'glow-cyan': '0 0 40px -8px rgb(var(--cyan) / 0.55)',
        card: '0 10px 40px -12px rgb(0 0 0 / 0.35)',
      },
      keyframes: {
        pulseLine: {
          '0%': { strokeDashoffset: '240' },
          '100%': { strokeDashoffset: '0' },
        },
        floaty: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        pulseLine: 'pulseLine 2.4s ease-in-out infinite',
        floaty: 'floaty 6s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
}
