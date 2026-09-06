/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        yellow: {
          DEFAULT: "#F2B01E",
          dark: "#DF9E10",
        },
        ink: {
          DEFAULT: "#141414",
          soft: "#2A2A2A",
        },
        body: "#45454B",
        line: "#E8E4DC",
        cream: "#FAF7F1",
        muted: "#9A9285",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        script: ["var(--font-caveat)", "cursive"],
      },
      maxWidth: {
        wrap: "1200px",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.35 },
        },
      },
      animation: {
        "fade-up": "fade-up .8s ease forwards",
        blink: "blink 1.8s ease-in-out infinite",
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(20,20,20,0.25)",
      },
    },
  },
  plugins: [],
};
