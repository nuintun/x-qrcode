/**
 * @module rspack.config.prod
 * @description 生产环境 Rspack 配置
 */

const mode = 'production';

process.env.NODE_ENV = mode;
process.env.BABEL_ENV = mode;

import rspack from '@rspack/core';
import targets from '../lib/targets.js';
import resolveConfigure from './rspack.config.base.js';

(async () => {
  const configure = await resolveConfigure(mode);

  configure.devtool = false;
  configure.experiments.cache.version = 'prod';

  // 使用自定义 minimizer 工具
  configure.optimization.minimizer = [
    new rspack.SwcJsMinimizerRspackPlugin({
      minimizerOptions: {
        format: {
          comments: false
        }
      }
    }),
    new rspack.LightningCssMinimizerRspackPlugin({
      minimizerOptions: {
        errorRecovery: false,
        targets: await targets()
      }
    })
  ];

  const compiler = rspack(configure);
  const logger = compiler.getInfrastructureLogger(configure.name);

  compiler.run((error, stats) => {
    if (error) {
      logger.error(error);
    } else {
      logger.info(stats.toString(compiler.options.stats));
    }
  });
})();
