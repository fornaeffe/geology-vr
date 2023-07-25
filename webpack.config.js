const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    bundle: './src/index.ts',
    wmsClientTest: './src/wmsClientTest.ts',
    ol: './src/ol.ts'
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'script'),
  },
};