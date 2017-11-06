var HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
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
      template: path.resolve(__dirname, 'src/popup/cardchecker.ejs')
    }),
    new ExtractTextPlugin( 'popup.css?hash=[chunkhash]' )
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
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },

      { test: /\.less$/, use: ExtractTextPlugin.extract({ use: [ "css-loader", "less-loader" ] }) }
    ]
  }
};