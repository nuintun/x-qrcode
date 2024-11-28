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

  const blob = await canvas.convertToBlob();

  return await blobToDataURL(blob);
}
