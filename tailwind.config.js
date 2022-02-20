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
        container: "430px",
        container_mobile: "375px",
        barX: "400px",
        barX_mobile: "350px",
        picker: "40px",

        // picker_mobile: "30px",
      },
    },
  },
  plugins: [],
};
