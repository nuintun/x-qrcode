const path = require('path');
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
    path: path.resolve('x-qrcode')
  },
  module: {
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
    new CaseSensitivePathsPlugin(),
    new MiniCssExtractPlugin({ filename: 'css/[name].css' }),
    new CopyWebpackPlugin([
      { from: './src/images', to: path.resolve('x-qrcode/images') },
      { from: './src/_locales', to: path.resolve('x-qrcode/_locales') },
      { from: './src/popup.html', to: path.resolve('x-qrcode/popup.html') },
      { from: './src/manifest.json', to: path.resolve('x-qrcode/manifest.json') }
    ]),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false, cleanOnceBeforeBuildPatterns: [path.resolve('x-qrcode')] })
  ],
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
    repl: 'empty',
    dgram: 'empty',
    module: 'empty',
    cluster: 'empty',
    readline: 'empty',
    child_process: 'empty'
  },
  stats: {
    cached: false,
    cachedAssets: false,
    children: false,
    chunks: false,
    chunkModules: false,
    chunkOrigins: false,
    entrypoints: false,
    modules: false,
    moduleTrace: false,
    publicPath: false,
    reasons: false,
    source: false,
    timings: false
  },
  performance: {
    hints: false
  }
};
