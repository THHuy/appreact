module.exports = {
  presets: [
    ["@babel/preset-env"],
    ["@babel/preset-react", { runtime: "automatic" }], // ✅ dòng này rất quan trọng
  ],
};
