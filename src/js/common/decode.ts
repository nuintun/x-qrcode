/**
 * @module decode
 */

import {
  binarize,
  BitMatrix,
  Charset,
  Decoded,
  Decoder,
  Detector,
  grayscale,
  Pattern as IPattern,
  Point as IPoint
} from '@nuintun/qrcode';
import chardet from 'chardet';

export interface Point {
  x: number;
  y: number;
}

export interface Pattern extends Point {
  moduleSize: number;
}

export type DecodeResult = DecodedItem[] | null;

export interface DecodedItem extends Omit<Decoded, 'codewords'> {
  center: Point;
  alignment: Pattern | null;
  timing: [topLeft: Point, topRight: Point, bottomLeft: Point];
  finder: [topLeft: Pattern, topRight: Pattern, bottomLeft: Pattern];
  corners: [topLeft: Point, topRight: Point, bottomRight: Point, bottomLeft: Point];
}

function toPoint(point: IPoint): Point {
  return {
    x: point.x,
    y: point.y
  };
}

function toPattern(pattern: IPattern): Pattern {
  return {
    x: pattern.x,
    y: pattern.y,
    moduleSize: pattern.moduleSize
  };
}

function decodeText(bytes: Uint8Array, charset: Charset): string {
  let label: string | null = null;

  // 无 ECI 时默认编码为 ISO-8859-1，此时才进行编码检查。
  if (charset === Charset.ISO_8859_1) {
    label = chardet.detect(bytes);
  }

  // 编码检查失败，使用默认编码。
  if (label == null) {
    label = charset.label;
  }

  // 用获得的编码进行解码，如果出错则使用 UTF-8 解码。
  try {
    return new TextDecoder(label).decode(bytes);
  } catch (error) {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

function decodeBitMatrix(matrix: BitMatrix, strict?: boolean): DecodeResult {
  const detector = new Detector({
    strict
  });

  const decoder = new Decoder({
    decode: decodeText
  });

  const success: DecodedItem[] = [];

  const detected = detector.detect(matrix);

  let current = detected.next();

  while (!current.done) {
    let succeed = false;

    const detect = current.value;

    try {
      const { size, finder, alignment } = detect;
      const decoded = decoder.decode(detect.matrix);
      // Finder
      const { topLeft, topRight, bottomLeft } = finder;
      // Corners
      const topLeftCorner = detect.mapping(0, 0);
      const topRightCorner = detect.mapping(size, 0);
      const bottomRightCorner = detect.mapping(size, size);
      const bottomLeftCorner = detect.mapping(0, size);
      // Timing
      const topLeftTiming = detect.mapping(6.5, 6.5);
      const topRightTiming = detect.mapping(size - 6.5, 6.5);
      const bottomLeftTiming = detect.mapping(6.5, size - 6.5);

      success.push({
        fnc1: decoded.fnc1,
        mask: decoded.mask,
        level: decoded.level,
        mirror: decoded.mirror,
        content: decoded.content,
        version: decoded.version,
        corrected: decoded.corrected,
        symbology: decoded.symbology,
        structured: decoded.structured,
        alignment: alignment ? toPattern(alignment) : null,
        center: toPoint(detect.mapping(size / 2, size / 2)),
        finder: [toPattern(topLeft), toPattern(topRight), toPattern(bottomLeft)],
        timing: [toPoint(topLeftTiming), toPoint(topRightTiming), toPoint(bottomLeftTiming)],
        corners: [toPoint(topLeftCorner), toPoint(topRightCorner), toPoint(bottomRightCorner), toPoint(bottomLeftCorner)]
      });

      succeed = true;
    } catch {
      // 解码失败，跳过
    }

    current = detected.next(succeed);
  }

  return success.length > 0 ? success : null;
}

export function decode(image: ImageBitmap, strict?: boolean): DecodeResult {
  const { width, height } = image;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  const luminances = grayscale(context.getImageData(0, 0, width, height));
  const binarized = binarize(luminances, width, height);

  const decoded = decodeBitMatrix(binarized, strict);

  if (decoded !== null) {
    return decoded;
  }

  binarized.flip();

  return decodeBitMatrix(binarized, strict);
}
