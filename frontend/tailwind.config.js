/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Mapped onto the CSS custom properties in app/globals.css (the design
      // prototype's tokens), so Tailwind utilities (bg-teal-700, font-display,
      // rounded-md, ...) stay pixel-identical to the prototype instead of
      // reintroducing a second, drifting color/spacing system.
      colors: {
        paper: "var(--paper)",
        "paper-2": "var(--paper-2)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        teal: {
          900: "var(--teal-900)",
          700: "var(--teal-700)",
          600: "var(--teal-600)",
          100: "var(--teal-100)",
        },
        coral: {
          DEFAULT: "var(--coral)",
          dark: "var(--coral-dark)",
          100: "var(--coral-100)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          100: "var(--gold-100)",
        },
        line: "var(--line)",
        "line-dark": "var(--line-dark)",
        danger: "var(--danger)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
        mono: ["var(--font-mono)"],
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        card: "var(--shadow-card)",
      },
    },
  },
  plugins: [],
}

