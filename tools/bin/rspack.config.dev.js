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

  const compiler = rspack(configure);

  compiler.watch({ aggregateTimeout: 256 }, (error, stats) => {
    if (error) {
      console.error(error);
    } else {
      console.log(stats.toString(compiler.options.stats));
    }
  });
})();
