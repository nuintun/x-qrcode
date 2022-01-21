const webpack = require('webpack');
const configure = require('./webpack.config.dev');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.devtool = false;

configure.plugins.push(new webpack.optimize.AggressiveMergingPlugin());

configure.optimization.minimizer = [new CssMinimizerPlugin(), new TerserPlugin()];

module.exports = configure;
