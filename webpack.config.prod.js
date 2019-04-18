const configure = require('./webpack.config.dev');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

configure.mode = mode;
configure.devtool = 'none';

configure.plugins.push(new OptimizeCSSAssetsPlugin({ cssProcessorOptions: { reduceIdents: false } }));

module.exports = configure;
