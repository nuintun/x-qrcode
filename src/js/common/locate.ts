/**
 * @module locate
 */

import { blobToDataURL } from './url';
import { DecodedItem, Pattern, Point } from './decode';

export type Context2D = CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

export type LocateItem = Pick<DecodedItem, 'timing' | 'finder' | 'corners' | 'alignment'>;

function markPattern(context: Context2D, { x, y, moduleSize }: Pattern, fillStyle: string): void {
  context.save();

  context.fillStyle = fillStyle;

  context.beginPath();
  context.arc(x, y, moduleSize * 0.5, 0, Math.PI * 2);
  context.closePath();
  context.fill();

  context.restore();
}

function drawLine(context: Context2D, points: Point[], strokeStyle: string, closePath?: boolean): void {
  context.save();

  context.lineWidth = 1;
  context.lineCap = 'square';
  context.lineJoin = 'miter';
  context.strokeStyle = strokeStyle;

  const [start] = points;
  const { length } = points;

  context.beginPath();
  context.moveTo(start.x, start.y);

  for (let i = 1; i < length; i++) {
    const { x, y } = points[i];

    context.lineTo(x, y);
  }

  if (closePath) {
    context.closePath();
  }

  context.stroke();

  context.restore();
}

export function locate(image: ImageBitmap, locations: LocateItem[]): Promise<string | null> {
  const { width, height } = image;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  for (const { timing, finder, corners, alignment } of locations) {
    drawLine(context, corners, '#00ff00', true);
    drawLine(context, [finder[2], finder[0], finder[1]], '#ff0000');
    drawLine(context, [timing[2], timing[0], timing[1]], '#00ff00');

    markPattern(context, finder[0], '#ff0000');
    markPattern(context, finder[1], '#00ff00');
    markPattern(context, finder[2], '#0000ff');

    if (alignment != null) {
      markPattern(context, alignment, '#ff00ff');
    }
  }

  return canvas.convertToBlob().then(
    blob => blobToDataURL(blob),
    () => null
  );
}
