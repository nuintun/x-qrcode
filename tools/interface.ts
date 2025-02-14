/**
 * @module interface
 * @description 类型定义
 */

import { Configuration } from '@rspack/core';

/**
 * @description Page 配置
 */
export interface Page {
  title?: string;
  chunks: string[];
  filename: string;
  meta?: Record<string, string>;
}

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
 * @description App 配置
 */
export interface AppConfig extends Pick<Configuration, 'context' | 'plugins' | 'externals'> {
  name: string;
  pages?: Page[];
  outputPath: string;
  publicPath?: string;
  env?: Env | EnvFunction;
  meta?: Record<string, string>;
  entry: Prop<Configuration, 'entry'>;
  alias?: Prop<Prop<Configuration, 'resolve'>, 'alias'>;
}
