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

  configure.devtool = 'inline-source-map';
  configure.experiments.cache.version = 'dev';

  const compiler = rspack(configure);
  const logger = compiler.getInfrastructureLogger(configure.name);

  compiler.watch({ aggregateTimeout: 256 }, (error, stats) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info(stats.toString(compiler.options.stats));
    }
  });
})();
