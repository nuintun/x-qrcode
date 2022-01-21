const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    popup: './src/js/popup.js',
    content: './src/js/content.js',
    background: './src/js/background.js'
  },
  output: {
    filename: 'js/[name].js',
    hashFunction: 'xxhash64',
    chunkFilename: `js/[name].js`,
    path: path.resolve('x-qrcode'),
    assetModuleFilename: `[path][name][ext]`
  },
  module: {
    strictExportPresence: true,
    rules: [
      // The loader for js
      {
        test: /\.js$/i,
        exclude: /[\\/]node_modules[\\/]/,
        use: [{ loader: 'babel-loader', options: { highlightCode: true, cacheDirectory: true } }]
      },
      // The loader for css
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { sourceMap: true, importLoaders: 1 } },
          { loader: 'postcss-loader', options: { sourceMap: true } }
        ]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CaseSensitivePathsPlugin(),
    new webpack.ProgressPlugin({ percentBy: 'entries' }),
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    new CopyWebpackPlugin({
      patterns: [
        { from: './src/images', to: path.resolve('x-qrcode/images') },
        { from: './src/_locales', to: path.resolve('x-qrcode/_locales') },
        { from: './src/popup.html', to: path.resolve('x-qrcode/popup.html') },
        { from: './src/manifest.json', to: path.resolve('x-qrcode/manifest.json') }
      ]
    })
  ],
  stats: {
    colors: true,
    chunks: false,
    children: false,
    entrypoints: false,
    runtimeModules: false,
    dependentModules: false
  },
  performance: {
    hints: false
  },
  optimization: {
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    removeAvailableModules: true
  }
};
