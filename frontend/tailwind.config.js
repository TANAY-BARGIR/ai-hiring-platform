/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core navy palette
        navy: {
          900: '#022448',  // primary — darkest
          800: '#1e3a5f',  // primary container
          700: '#2d486d',
        },
        // Action blue
        blue: {
          600: '#0058be',  // secondary — buttons, CTAs
          500: '#2170e4',  // secondary container — hover
          100: '#d5e3ff',  // light blue tint
          50:  '#e7eeff',  // surface container
        },
        // Surface grays
        slate: {
          900: '#111c2d',  // on-surface — body text
          600: '#43474e',  // on-surface-variant — secondary text
          400: '#74777f',  // outline — muted text
          300: '#c4c6cf',  // outline-variant — borders
          100: '#f0f3ff',  // surface-container-low
          50:  '#f9f9ff',  // surface — page background
        },
        // Semantic
        success: '#10b981',
        danger: '#ba1a1a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'ambient': '0 4px 24px -4px rgba(2, 36, 72, 0.08)',
        'card': '0 1px 3px rgba(2, 36, 72, 0.06)',
      }
    },
  },
  plugins: [],
}
