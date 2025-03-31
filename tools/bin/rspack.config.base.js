/**
 * @module rspack.config.base
 * @description 基础 Rspack 配置
 */

import rspack from '@rspack/core';
import { resolve } from 'node:path';
import resolveRules from '../lib/rules.js';
import appConfig from '../../app.config.js';

/**
 * @function resolveEnvironment
 * @param {string} mode
 * @param {object} env
 * @return {Promise<object>}
 */
async function resolveEnvironment(mode, env) {
  if (typeof env === 'function') {
    env = await env(mode, process.env);
  }

  env = {
    ...env,
    __APP_NAME__: appConfig.name,
    __DEV__: mode !== 'production'
  };

  const output = {};
  const entries = Object.entries(env);

  for (const [key, value] of entries) {
    output[key] = JSON.stringify(value);
  }

  return output;
}

/**
 * @function getHtmlRspackPlugins
 * @param {string} mode
 * @param {import('../interface.ts').Page[]} pages
 * @return {import('@rspack/core').HtmlRspackPluginOptions[]}
 */

const getHtmlRspackPlugins = (mode, pages) => {
  const plugins = [];
  const minify = mode === 'production';
  const template = resolve('tools/lib/template.ejs');

  for (const page of pages) {
    const meta = page.meta || appConfig.meta;
    const title = page.title || appConfig.name;

    plugins.push(new rspack.HtmlRspackPlugin({ ...page, meta, title, minify, template }));
  }

  return plugins;
};

/**
 * @function rspackrc
 * @param {string} mode
 * @return {Promise<import('@rspack/core').Configuration>}
 */
export default async mode => {
  const isDevelopment = mode !== 'production';

  const env = await resolveEnvironment(mode, appConfig.env);

  const progress = {
    progressChars: '█▒',
    prefix: `[${appConfig.name}]`,
    template: '{prefix:.bold} {bar:25.green/white.dim} ({percent}%) {wide_msg:.dim}'
  };

  return {
    mode,
    cache: true,
    performance: false,
    name: appConfig.name,
    entry: appConfig.entry,
    context: appConfig.context,
    output: {
      clean: true,
      filename: 'js/[name].js',
      hashFunction: 'xxhash64',
      path: appConfig.outputPath,
      publicPath: appConfig.publicPath,
      chunkFilename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      cssFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
      cssChunkFilename: `css/[${isDevelopment ? 'name' : 'contenthash'}].css`,
      assetModuleFilename: `[path][${isDevelopment ? 'name' : 'contenthash'}][ext]`
    },
    module: {
      parser: {
        'css/auto': {
          namedExports: true
        }
      },
      rules: await resolveRules(mode),
      generator: {
        'css/auto': {
          localIdentName: '[local]-[hash:8]',
          exportsConvention: 'camel-case-only'
        }
      }
    },
    resolve: {
      alias: appConfig.alias,
      extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    plugins: [
      new rspack.ProgressPlugin(progress),
      new rspack.WarnCaseSensitiveModulesPlugin(),
      new rspack.DefinePlugin(env),
      ...getHtmlRspackPlugins(mode, appConfig.pages),
      ...(appConfig.plugins || [])
    ],
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      removeAvailableModules: true
    },
    stats: {
      all: false,
      assets: true,
      colors: true,
      errors: true,
      timings: true,
      version: true,
      warnings: true,
      errorsCount: true,
      warningsCount: true,
      groupAssetsByPath: true
    },
    externals: appConfig.externals,
    externalsType: appConfig.externalsType,
    experiments: {
      css: true,
      cache: {
        type: 'persistent',
        storage: {
          type: 'filesystem',
          directory: resolve('node_modules/.cache/rspack')
        }
      }
    }
  };
};
