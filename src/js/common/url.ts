/**
 * @module url
 */

export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('failed to read Blob as Data URL'));
    };

    reader.readAsDataURL(blob);
  });
}

export async function bitmapToDataURL(image: ImageBitmap): Promise<string> {
  const { width, height } = image;
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext('2d')!;

  context.drawImage(image, 0, 0);

  return canvasToDataURL(canvas);
}

export async function canvasToDataURL(canvas: OffscreenCanvas): Promise<string> {
  const blob = await canvas.convertToBlob({
    quality: 0.82,
    type: 'image/webp'
  });

  return blobToDataURL(blob);
}
