/**
 * @module app.config
 * @description App 配置
 */

import rspack from '@rspack/core';
import { resolve } from 'node:path';

const root = resolve('src');

/**
 * @type {import('./tools/interface').AppConfig}
 */
export default {
  context: root,
  name: 'QRCode',
  publicPath: '',
  alias: { '/': root },
  pages: [
    {
      chunks: ['popup'],
      filename: 'popup.html'
    },
    {
      chunks: ['options'],
      filename: 'options.html'
    }
  ],
  outputPath: resolve('extension'),
  entry: {
    popup: resolve('src/js/popup/index.tsx'),
    content: resolve('src/js/content/index.tsx'),
    options: resolve('src/js/options/index.tsx'),
    background: resolve('src/js/background/index.ts')
  },
  meta: { viewport: 'width=device-width,initial-scale=1.0' },
  plugins: [
    new rspack.CopyRspackPlugin({
      patterns: [
        { from: 'images', to: 'images' },
        { from: '_locales', to: '_locales' },
        { from: 'manifest.json', to: 'manifest.json' }
      ]
    })
  ]
};
