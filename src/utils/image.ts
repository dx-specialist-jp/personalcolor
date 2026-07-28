const MAX_DIMENSION_PX = 1024;

export async function loadImageBitmapFromFile(file: File): Promise<ImageBitmap> {
  return await createImageBitmap(file);
}

/**
 * スマホ写真(数千px四方)をそのまま処理すると顔検出・色抽出が重くなるため、
 * 長辺が MAX_DIMENSION_PX を超える場合は縮小してからCanvasへ描画する。
 * 縮小後の解像度でも肌領域サンプリングには十分。
 */
export function drawToCanvas(bitmap: ImageBitmap): HTMLCanvasElement {
  const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D コンテキストの取得に失敗しました');
  ctx.drawImage(bitmap, 0, 0, width, height);
  return canvas;
}
