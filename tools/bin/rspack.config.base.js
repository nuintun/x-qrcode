/**
 * @module rspack.config.base
 * @description 基础 Rspack 配置
 */

import path from 'node:path';
import rspack from '@rspack/core';
import { resolve } from 'node:path';
import resolveRules from '../lib/rules.js';

const root = path.resolve('src');

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
 * @type {import('../interface').AppConfig}
 */
const appConfig = {
  name: 'QRCode',
  publicPath: '',
  alias: { '/': root },
  context: path.resolve('src'),
  outputPath: path.resolve('extension'),
  entry: {
    popup: path.resolve('./src/js/popup/index.tsx'),
    content: path.resolve('./src/js/content/index.tsx'),
    options: path.resolve('./src/js/options/index.tsx'),
    background: path.resolve('src/js/background/index.ts')
  },
  meta: { viewport: 'width=device-width,initial-scale=1.0' }
};

/**
 * @function rspackrc
 * @param {string} mode
 * @return {Promise<import('@rspack/core').Configuration>}
 */
export default async mode => {
  const isDevelopment = mode !== 'production';

  const progress = {
    prefix: '[Rspack]',
    progressChars: '█▒'
  };

  const popup = {
    chunks: ['popup'],
    meta: appConfig.meta,
    title: appConfig.name,
    minify: !isDevelopment,
    template: resolve('tools/lib/template.ejs'),
    filename: path.resolve('extension/popup.html')
  };

  const options = {
    chunks: ['options'],
    meta: appConfig.meta,
    title: appConfig.name,
    minify: !isDevelopment,
    template: resolve('tools/lib/template.ejs'),
    filename: path.resolve('extension/options.html')
  };

  const env = await resolveEnvironment(mode, appConfig.env);

  return {
    mode,
    cache: true,
    name: appConfig.name,
    entry: appConfig.entry,
    context: appConfig.context,
    output: {
      clean: true,
      filename: 'js/[name].js',
      hashFunction: 'xxhash64',
      path: appConfig.outputPath,
      chunkFilename: 'js/[name].js',
      cssFilename: 'css/[name].css',
      publicPath: appConfig.publicPath,
      cssChunkFilename: 'css/[name].css',
      assetModuleFilename: '[path][name][ext]'
    },
    experiments: {
      css: true,
      cache: {
        type: 'persistent'
      },
      parallelCodeSplitting: true
    },
    externals: appConfig.externals,
    externalsType: appConfig.externalsType,
    stats: {
      colors: true,
      chunks: false,
      children: false,
      entrypoints: false,
      runtimeModules: false,
      dependentModules: false
    },
    performance: {
      hints: false
    },
    resolve: {
      alias: appConfig.alias,
      fallback: { url: false },
      extensions: ['.ts', '.tsx', '.js', '.jsx']
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
    plugins: [
      new rspack.DefinePlugin(env),
      new rspack.ProgressPlugin(progress),
      new rspack.HtmlRspackPlugin(popup),
      new rspack.HtmlRspackPlugin(options),
      new rspack.WarnCaseSensitiveModulesPlugin(),
      new rspack.CopyRspackPlugin({
        patterns: [
          { from: 'images', to: 'images' },
          { from: '_locales', to: '_locales' },
          { from: 'manifest.json', to: 'manifest.json' }
        ]
      })
    ],
    optimization: {
      splitChunks: false,
      runtimeChunk: false,
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      removeAvailableModules: true
    }
  };
};
