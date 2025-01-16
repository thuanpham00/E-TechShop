// eslint-disable-next-line @typescript-eslint/no-require-imports
const plugin = require("tailwindcss/plugin")

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  corePlugins: {
    container: false // tắt class container mặc định
  },
  theme: {
    extend: {
      colors: {
        primaryRed: "#e30019",
        secondRed: "#BE1529"
      }
    }
  },
  darkMode: "class",
  plugins: [
    plugin(function ({ addComponents }) {
      addComponents({
        ".container": {
          // set up class container mới
          maxWidth: "80rem", // 1280px
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "10px",
          paddingRight: "10px"
        }
      })
    })
    // require('tailwindcss-animate'),
    // require('@tailwindcss/line-clamp')
    // thêm lớp line-clamp quá số dòng thì ...
  ]
}
