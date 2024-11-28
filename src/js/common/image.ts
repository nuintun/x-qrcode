/**
 * @module image
 */

export async function getImageBitmap(
  url: string,
  sx?: number,
  sy?: number,
  sw?: number,
  sh?: number,
  options?: ImageBitmapOptions
): Promise<ImageBitmap> {
  const response = await fetch(url);
  const blob = await response.blob();

  if (sx != null && sy != null && sw != null && sh != null) {
    return await createImageBitmap(blob, sx, sy, sw, sh, options);
  }

  return await createImageBitmap(blob, options);
}
