const path = require("node:path");

module.exports = {
  mode: "development",
  entry: "./client.js",
  output: {
    filename: "./client.bundle.js",
    path: path.resolve(__dirname, "public"),
  },
  resolve: {
    extensions: [".js", ".jsx", ".tsx", ".ts"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              ["@babel/preset-react", { runtime: "automatic" }],
            ],
          },
        },
      },
    ],
  },
};
