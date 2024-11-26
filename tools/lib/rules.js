/**
 * @module rules
 * @description 配置 Webpack 规则
 */

import swcrc from '../../.swcrc.js';

/**
 * @function resolveRules
 * @param {string} mode
 * @return {Promise<NonNullable<import('webpack').Configuration['module']>['rules']>}
 */
export default async mode => {
  const isDevelopment = mode !== 'production';
  const swcOptions = { ...(await swcrc()), swcrc: false };

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
          type: 'css/auto'
        },
        // The loader for scss or sass
        {
          type: 'css/auto',
          test: /\.s[ac]ss$/i,
          use: [
            {
              loader: 'sass-loader'
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
                  loader: '@nuintun/svgo-loader'
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
                  loader: 'svgc-loader'
                }
              ]
            },
            {
              type: 'asset/resource',
              use: [
                {
                  loader: '@nuintun/svgo-loader'
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
