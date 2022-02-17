module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "real-red": "#ee0000",
        "real-green": "#00ee00",
        "real-blue": "#0000ee",
      },
      spacing: {
        barX: "400px",
        picker: "40px",
        barX_mobile: "300px",
        picker_mobile: "30px",
      },
    },
  },
  plugins: [],
};
