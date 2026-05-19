// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#14532d',      // Deep Forest Green
        sage: '#d1fae5',         // Soft Sage
        accent: '#e07a5f',       // Warm Terracotta
        gold: '#ffd166',         // Sunlit Gold
        stone: '#374151',        // Stone Gray
        cloud: '#f9fafb',        // Cloud White
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
