/**
 * @module .swcrc
 * @description Swc 配置
 */

import targets from './tools/lib/targets.js';

/**
 * @function swcrc
 * @param {string} mode
 * @return {Promise<import('@rspack/core').SwcLoaderOptions>}
 */
export default async () => {
  return {
    jsc: {
      externalHelpers: false,
      parser: {
        tsx: true,
        syntax: 'typescript'
      },
      transform: {
        react: {
          runtime: 'automatic'
        }
      }
    },
    env: {
      targets: await targets()
    }
  };
};
