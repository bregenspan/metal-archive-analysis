const path = require('path');
const process = require('process');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'main.js'),
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env']
          }
        }
      },
      { test: /\.(json|mp3)$/, use: 'file-loader' }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      hash: process.env.NODE_ENV === 'production',
      template: 'index.html'
    })
  ]
};
