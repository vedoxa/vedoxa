/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Aapka original path
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    
    // Safety ke liye Next.js/React ke standard paths add kiye gaye hain
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Aapke SoulEchoPage component ke custom animations yahan define kiye gaye hain
      // Taki aap unhe directly class mein use kar sakein (e.g., className="animate-slideUp")
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        slideUp: 'slideUp 0.4s ease-out forwards',
        fadeIn: 'fadeIn 1s ease-out forwards',
      },
    },
  },
  plugins: [],
}
