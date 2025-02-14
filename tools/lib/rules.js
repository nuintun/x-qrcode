/**
 * @module rules
 * @description 配置 Webpack 规则
 */

import swcrc from '../../.swcrc.js';
import svgorc from '../../.svgorc.js';
import lightningcssrc from '../../.lightningcssrc.js';

/**
 * @function resolveRules
 * @param {string} mode
 * @return {Promise<NonNullable<import('webpack').Configuration['module']>['rules']>}
 */
export default async mode => {
  const swcOptions = await swcrc(mode);
  const isDevelopment = mode !== 'production';
  const lightningcssOptions = await lightningcssrc(mode);
  const svgoOptions = { ...(await svgorc(mode)), configFile: false };

  return [
    {
      oneOf: [
        // The loader for js
        {
          test: /\.[jt]sx?$/i,
          exclude: /[\\/]node_modules[\\/]/,
          use: [
            {
              loader: 'builtin:swc-loader',
              options: swcOptions
            }
          ]
        },
        // The loader for css
        {
          test: /\.css$/i,
          type: 'css/auto',
          use: [
            {
              loader: 'builtin:lightningcss-loader',
              options: lightningcssOptions
            }
          ]
        },
        // The loader for scss or sass
        {
          type: 'css/auto',
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: 'builtin:lightningcss-loader',
              options: lightningcssOptions
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment
              }
            }
          ]
        },
        // The loader for assets
        {
          type: 'asset/resource',
          test: /\.(mp3|ogg|wav|mp4|flv|webm)$/i
        },
        {
          test: /\.svg$/i,
          oneOf: [
            {
              issuer: /\.[jt]sx?$/i,
              type: 'asset/resource',
              resourceQuery: /^\?url$/,
              use: [
                {
                  loader: '@nuintun/svgo-loader',
                  options: svgoOptions
                }
              ]
            },
            {
              issuer: /\.[jt]sx?$/i,
              use: [
                {
                  loader: 'builtin:swc-loader',
                  options: swcOptions
                },
                {
                  loader: 'svgc-loader',
                  options: svgoOptions
                }
              ]
            },
            {
              type: 'asset/resource',
              use: [
                {
                  loader: '@nuintun/svgo-loader',
                  options: svgoOptions
                }
              ]
            }
          ]
        },
        {
          type: 'asset/resource',
          test: /\.(cur|png|gif|bmp|ico|jpe?g|webp|woff2?|ttf|eot)$/i
        }
      ]
    }
  ];
};
