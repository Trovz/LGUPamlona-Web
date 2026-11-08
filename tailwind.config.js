/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)', card: 'var(--card)', ink: 'var(--ink)', muted: 'var(--muted)',
        line: 'var(--line)', thead: 'var(--thead)', brand: 'var(--brand)', side: 'var(--side)',
        'side-active': 'var(--side-active)', danger: 'var(--danger)',
        'interactive-hover': 'var(--interactive-hover)', 'interactive-hover-text': 'var(--interactive-hover-text)',
        'row-hover': 'var(--row-hover)',
      },
    },
  },
  plugins: [],
}
