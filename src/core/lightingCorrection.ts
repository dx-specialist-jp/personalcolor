import { clamp } from './colorSpace';

/**
 * グレーワールド仮定によるホワイトバランス補正。
 * 「画像全体のR,G,B平均は理想的には無彩色(グレー)に近くなるはず」という仮定のもと、
 * 各チャンネルの平均が揃うようにスケーリングする。オレンジ照明・青白い照明など
 * 照明条件による肌色の偏りを軽減し、診断精度を照明環境に左右されにくくする。
 *
 * ImageDataを直接書き換えて返す(呼び出し側でコピー済みのImageDataを渡すこと)。
 */
export function applyGrayWorldWhiteBalance(imageData: ImageData): ImageData {
  const { data, width, height } = imageData;
  const totalPixels = width * height;
  if (totalPixels === 0) return imageData;

  // 大きな画像でも高速に統計を取れるよう間引いてサンプリングする
  const stride = Math.max(1, Math.floor(totalPixels / 200_000));

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let count = 0;

  for (let i = 0; i < data.length; i += 4 * stride) {
    sumR += data[i] ?? 0;
    sumG += data[i + 1] ?? 0;
    sumB += data[i + 2] ?? 0;
    count++;
  }
  if (count === 0) return imageData;

  const avgR = sumR / count;
  const avgG = sumG / count;
  const avgB = sumB / count;
  const gray = (avgR + avgG + avgB) / 3;

  // 極端な照明(単色に近い写真等)で色が破綻しないよう補正量をクランプする
  const MAX_GAIN = 1.6;
  const MIN_GAIN = 0.6;
  const gainR = clamp(gray / Math.max(avgR, 1), MIN_GAIN, MAX_GAIN);
  const gainG = clamp(gray / Math.max(avgG, 1), MIN_GAIN, MAX_GAIN);
  const gainB = clamp(gray / Math.max(avgB, 1), MIN_GAIN, MAX_GAIN);

  for (let i = 0; i < data.length; i += 4) {
    data[i] = clamp((data[i] ?? 0) * gainR, 0, 255);
    data[i + 1] = clamp((data[i + 1] ?? 0) * gainG, 0, 255);
    data[i + 2] = clamp((data[i + 2] ?? 0) * gainB, 0, 255);
  }

  return imageData;
}
