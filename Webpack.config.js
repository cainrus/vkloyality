var HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: "./src/popup/cardchecker.tsx",
  output: {
    filename: "popup.js",
    path: path.resolve(__dirname, "extension/build")
  },

  plugins: [
    new HtmlWebpackPlugin({
      title: '__MSG_appName__',
      filename: path.resolve(__dirname, 'extension/build/popup.html'),
      template: path.resolve(__dirname, 'src/popup/cardchecker.ejs'),
      externals: [
        'https://unpkg.com/react@15.3.1/dist/react.min.js',
        'https://unpkg.com/react-dom@15.3.1/dist/react-dom.min.js'
      ]
    })
  ],

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json", ".ejs"]
  },

  module: {
    rules: [
      // All files with a '.ts' or '.tsx' extension will be handled by 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
    ]
  },

  externals: {
    react: 'React',
    'react-dom': 'ReactDOM'
  }
};