/**
 * @module encode
 */

import { Alphanumeric, Byte, Charset, Encoder, EncoderOptions, Hanzi, Kanji, Numeric } from '@nuintun/qrcode';

export type EncodeResult = [error: Error] | [error: null, image: string];

export interface Options {
  quietZone?: number;
  background?: string;
  foreground?: string;
  moduleSize?: number;
  aimIndicator?: number;
  version?: 'Auto' | number;
  fnc1?: 'None' | 'GS1' | 'AIM';
  level?: 'L' | 'M' | 'Q' | 'H';
  charset?: keyof typeof Charset;
  mode?: 'Auto' | 'Numeric' | 'Alphanumeric' | 'Byte' | 'Kanji' | 'Hanzi';
}

function chooseBestMode(
  content: string,
  { mode = 'Auto', charset = 'UTF_8' }: Options
): Byte | Hanzi | Kanji | Numeric | Alphanumeric {
  switch (mode) {
    case 'Auto':
      const NUMERIC_RE = /^\d+$/;
      const ALPHANUMERIC_RE = /^[0-9A-Z$%*+-./: ]+$/;

      if (NUMERIC_RE.test(content)) {
        return new Numeric(content);
      } else if (ALPHANUMERIC_RE.test(content)) {
        return new Alphanumeric(content);
      }

      const hanzi = new Hanzi(content);

      try {
        hanzi.encode();

        return hanzi;
      } catch {
        // 跳过错误
      }

      const kanji = new Kanji(content);

      try {
        kanji.encode();

        return kanji;
      } catch {
        // 跳过错误
      }

      return new Byte(content, Charset[charset]);
    case 'Hanzi':
      return new Hanzi(content);
    case 'Kanji':
      return new Kanji(content);
    case 'Numeric':
      return new Numeric(content);
    case 'Alphanumeric':
      return new Alphanumeric(content);
    default:
      return new Byte(content, Charset[charset]);
  }
}

function hex2rgb(hex: string): [R: number, G: number, B: number] {
  const value = parseInt(hex.slice(1, 7), 16);

  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

function getHints({ fnc1 = 'None', aimIndicator = 0 }: Options): EncoderOptions['hints'] {
  switch (fnc1) {
    case 'GS1':
      return { fnc1: ['GS1'] };
    case 'AIM':
      return { fnc1: ['AIM', +aimIndicator] };
  }
}

export function encode(content: string, options: Options = {}): EncodeResult {
  const { level, version } = options;
  const encoder = new Encoder({
    level,
    version,
    hints: getHints(options)
  });

  try {
    const qrcode = encoder.encode(chooseBestMode(content, options));
    const { moduleSize, quietZone, background, foreground } = options;

    return [
      null,
      qrcode.toDataURL(moduleSize, {
        margin: quietZone,
        background: hex2rgb(background ?? '#ffffff'),
        foreground: hex2rgb(foreground ?? '#000000')
      })
    ];
  } catch (error) {
    return [error as Error];
  }
}
