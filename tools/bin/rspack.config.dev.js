/**
 * @module rspack.config.dev
 * @description 开发环境 Rspack 配置
 */

'use strict';

const mode = 'development';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import rspack from '@rspack/core';
import resolveConfigure from './rspack.config.base.js';

(async () => {
  const configure = await resolveConfigure(mode);

  configure.devtool = 'eval-cheap-module-source-map';
  configure.watchOptions = { aggregateTimeout: 256 };

  const compiler = rspack(configure);

  compiler.run((error, stats) => {
    compiler.close(() => {
      if (error) {
        console.error(error);
      } else {
        console.log(stats.toString(compiler.options.stats));
      }
    });
  });
})();
