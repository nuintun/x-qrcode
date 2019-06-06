/**
 * @module .babelrc
 * @listens MIT
 * @author nuintun
 * @description Babel configure.
 */

'use strict';

const browsers = require('./package.json').browserslist;

module.exports = {
  presets: [['@babel/preset-env', { loose: true, modules: false, targets: { browsers } }]],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-runtime', { useESModules: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }]
  ]
};
