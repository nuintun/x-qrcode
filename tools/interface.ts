/**
 * @module interface
 * @description 类型定义
 */

import { Options as SvgoOptions } from '@nuintun/svgo-loader';
import { Configuration, Plugin, SwcLoaderOptions } from '@rspack/core';

/**
 * @description Env 配置
 */
type Env = Record<string, unknown>;

/**
 * @description Env 配置函数
 */
interface EnvFunction {
  (mode: string, env: Env): Env | Promise<Env>;
}

/**
 * @description 获取对象指定属性非空类型
 */
type Prop<T, K extends keyof T> = NonNullable<T[K]>;

/**
 * @description Swc 配置
 */
export { SwcLoaderOptions as SwcConfig };

/**
 * @description Svgo 配置
 */
export interface SvgoConfig extends Omit<SvgoOptions, 'configFile'> {
  path?: string;
}

/**
 * @description App 配置
 */
export interface AppConfig extends Pick<Configuration, 'context' | 'externals'> {
  name: string;
  entryHTML: string;
  outputPath: string;
  publicPath?: string;
  env?: Env | EnvFunction;
  meta?: Record<string, string>;
  entry: Prop<Configuration, 'entry'>;
  alias?: Prop<Prop<Configuration, 'resolve'>, 'alias'>;
}
