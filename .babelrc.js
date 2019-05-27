/**
 * @module .babelrc
 * @listens MIT
 * @author nuintun
 * @description Babel configure.
 */

'use strict';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        loose: true,
        modules: false,
        targets: { browsers: ['Chrome >= 66', 'firefox >= 60'] }
      }
    ]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import',
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-runtime', { useESModules: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }]
  ]
};
