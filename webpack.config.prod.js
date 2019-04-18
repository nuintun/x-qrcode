const path = require('path');
const configure = require('./webpack.config.dev');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.devtool = 'none';

configure.plugins.push(
  new OptimizeCSSAssetsPlugin({ cssProcessorOptions: { reduceIdents: false } }),
  new CopyWebpackPlugin([{ from: './src/qruri.pem', to: path.resolve('dist/qruri.pem') }])
);

module.exports = configure;
