import { rgbToHsv, rgbToLab } from './colorSpace';
import type { ColorSample, Point2D, RgbColor } from '../types';

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2
    : (sorted[mid] ?? 0);
}

interface DiskRegion {
  center: Point2D;
  radiusPx: number;
}

/**
 * 円形領域内のピクセルから、白飛び(反射ハイライト)・黒つぶれ(影)を除外したうえで
 * チャンネルごとの中央値を代表色として採用する。中央値は平均より外れ値(産毛の陰影・
 * ほくろ・メガネの反射等)に強く、少数の異常画素に結果が引っ張られにくい。
 */
export function sampleRegionColor(imageData: ImageData, region: DiskRegion): ColorSample {
  const { data, width, height } = imageData;
  const { center, radiusPx } = region;

  const minX = Math.max(0, Math.floor(center.x - radiusPx));
  const maxX = Math.min(width - 1, Math.ceil(center.x + radiusPx));
  const minY = Math.max(0, Math.floor(center.y - radiusPx));
  const maxY = Math.min(height - 1, Math.ceil(center.y + radiusPx));
  const r2 = radiusPx * radiusPx;

  const allR: number[] = [];
  const allG: number[] = [];
  const allB: number[] = [];
  const filteredR: number[] = [];
  const filteredG: number[] = [];
  const filteredB: number[] = [];

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - center.x;
      const dy = y - center.y;
      if (dx * dx + dy * dy > r2) continue;

      const idx = (y * width + x) * 4;
      const r = data[idx] ?? 0;
      const g = data[idx + 1] ?? 0;
      const b = data[idx + 2] ?? 0;
      allR.push(r);
      allG.push(g);
      allB.push(b);

      const maxC = Math.max(r, g, b);
      const minC = Math.min(r, g, b);
      const isSpecularHighlight = maxC > 245 && maxC - minC < 12;
      const isShadow = maxC < 25;
      if (isSpecularHighlight || isShadow) continue;

      filteredR.push(r);
      filteredG.push(g);
      filteredB.push(b);
    }
  }

  const useFiltered = filteredR.length >= 8;
  const rs = useFiltered ? filteredR : allR;
  const gs = useFiltered ? filteredG : allG;
  const bs = useFiltered ? filteredB : allB;

  const rgb: RgbColor = { r: median(rs), g: median(gs), b: median(bs) };

  return {
    rgb,
    lab: rgbToLab(rgb),
    hsv: rgbToHsv(rgb),
    sampleCount: rs.length,
  };
}

/** 複数領域のサンプルを有効ピクセル数で重み付け平均し、代表色として再合成する */
export function averageColorSamples(samples: ColorSample[]): ColorSample {
  const weights = samples.map((s) => Math.max(s.sampleCount, 1));
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const weightedRgb = samples.reduce(
    (acc, s, i) => {
      const w = weights[i] ?? 1;
      return { r: acc.r + s.rgb.r * w, g: acc.g + s.rgb.g * w, b: acc.b + s.rgb.b * w };
    },
    { r: 0, g: 0, b: 0 },
  );
  const rgb: RgbColor = {
    r: weightedRgb.r / totalWeight,
    g: weightedRgb.g / totalWeight,
    b: weightedRgb.b / totalWeight,
  };

  return {
    rgb,
    lab: rgbToLab(rgb),
    hsv: rgbToHsv(rgb),
    sampleCount: samples.reduce((sum, s) => sum + s.sampleCount, 0),
  };
}
