/** @type {import("prettier").Config} */
const config = {
  endOfLine: "lf",
  plugins: ["prettier-plugin-tailwindcss"],
  tabWidth: 2,
  tailwindConfig: "./apps/web/tailwind.config.cjs",
  useTabs: false,
};

export default config;
