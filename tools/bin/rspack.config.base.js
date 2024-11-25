/**
 * @module rspack.config.base
 * @description 基础 Rspack 配置
 */

import path from 'node:path';
import rspack from '@rspack/core';
import { resolve } from 'node:path';
import resolveRules from '../lib/rules.js';

const js = path.resolve('src/js');
const css = path.resolve('src/css');
const images = path.resolve('src/images');

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
  ports: 8000,
  name: 'x-qrcode',
  publicPath: 'auto',
  context: path.resolve('src'),
  outputPath: path.resolve('x-qrcode'),
  entryHTML: path.resolve('x-qrcode/popup.html'),
  entry: {
    background: path.resolve('src/js/background.tsx'),
    content: path.resolve('./src/js/content.tsx'),
    popup: path.resolve('./src/js/popup.tsx')
  },
  alias: { '/js': js, '/css': css, '/images': images },
  meta: { viewport: 'width=device-width,initial-scale=1.0' }
};

/**
 * @function webpackrc
 * @param {string} mode
 * @return {Promise<import('webpack').Configuration>}
 */
export default async mode => {
  const isDevelopment = mode !== 'production';

  const progress = {
    prefix: '[Rspack]',
    progressChars: '█▒'
  };

  const html = {
    chunks: ['popup'],
    meta: appConfig.meta,
    title: appConfig.name,
    minify: !isDevelopment,
    filename: appConfig.entryHTML,
    template: resolve('tools/lib/template.ejs')
  };

  const env = await resolveEnvironment(mode, appConfig.env);

  return {
    mode,
    name: appConfig.name,
    entry: appConfig.entry,
    context: appConfig.context,
    output: {
      clean: true,
      hashFunction: 'xxhash64',
      path: appConfig.outputPath,
      publicPath: appConfig.publicPath,
      filename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      chunkFilename: `js/[${isDevelopment ? 'name' : 'contenthash'}].js`,
      assetModuleFilename: `[path][${isDevelopment ? 'name' : 'contenthash'}][ext]`
    },
    experiments: {
      css: true
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
      new rspack.HtmlRspackPlugin(html),
      new rspack.ProgressPlugin(progress),
      new rspack.CopyRspackPlugin({
        patterns: [
          { from: '_locales', to: '_locales' },
          { from: 'images/qrcode-*.png', to: 'images' },
          { from: 'manifest.json', to: 'manifest.json' }
        ]
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all'
      },
      runtimeChunk: 'single',
      removeEmptyChunks: true,
      mergeDuplicateChunks: true,
      removeAvailableModules: true
    }
  };
};
