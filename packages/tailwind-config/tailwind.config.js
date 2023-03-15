const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      flexBasis: {
        "1/7": "14.2857143%",
      },
      fontFamily: {
        sans: ["Open Sans", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("tailwindcss-radix")()],
};
