import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // fontFamily: {
      //   'sans': ["Macintosh", "sans-serif"],
      // },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  corePlugins: {
 }
} satisfies Config

