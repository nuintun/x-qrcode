/**
 * @module app.config
 * @description 应用配置
 */

import path from 'node:path';

const js = path.resolve('src/js');
const css = path.resolve('src/css');
const images = path.resolve('src/images');

/**
 * @type {import('./tools/interface').AppConfig}
 */
export default {
  ports: 8000,
  name: 'x-qrcode',
  publicPath: '/public/',
  context: path.resolve('app'),
  outputPath: path.resolve('wwwroot/public'),
  entryHTML: path.resolve('wwwroot/popup.html'),
  entry: {
    background: path.resolve('src/js/background.js'),
    content: path.resolve('./src/js/content.js'),
    popup: path.resolve('./src/js/popup.js')
  },
  favicon: path.resolve('src/images/qrcode-32.png'),
  alias: { '/js': js, '/css': css, '/images': images },
  meta: { viewport: 'width=device-width,initial-scale=1.0' }
};
