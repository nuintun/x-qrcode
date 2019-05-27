/**
 * @module .postcssrc
 * @listens MIT
 * @author nuintun
 * @description PostCSS configure.
 */

'use strict';

const autoprefixer = require('autoprefixer');

const sourceMap = process.env.NODE_ENV !== 'production';

module.exports = {
  sourceMap,
  plugins: [
    autoprefixer({
      flexbox: 'no-2009',
      browsers: ['Chrome >= 66', 'firefox >= 60']
    })
  ]
};
