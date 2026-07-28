import type { HsvColor, LabColor, RgbColor } from '../types';

// sRGB (D65) -> CIE Lab 変換。人間の色知覚に近い均等色空間で、
// 暖色/寒色(a*,b*)や明度(L*)の判定を安定して行うために使用する。
function srgbChannelToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

const D65_XN = 95.047;
const D65_YN = 100.0;
const D65_ZN = 108.883;

function labF(t: number): number {
  const delta = 6 / 29;
  return t > delta ** 3 ? Math.cbrt(t) : t / (3 * delta ** 2) + 4 / 29;
}

export function rgbToLab({ r, g, b }: RgbColor): LabColor {
  const lr = srgbChannelToLinear(r);
  const lg = srgbChannelToLinear(g);
  const lb = srgbChannelToLinear(b);

  const x = (lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375) * 100;
  const y = (lr * 0.2126729 + lg * 0.7151522 + lb * 0.072175) * 100;
  const z = (lr * 0.0193339 + lg * 0.119192 + lb * 0.9503041) * 100;

  const fx = labF(x / D65_XN);
  const fy = labF(y / D65_YN);
  const fz = labF(z / D65_ZN);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function rgbToHsv({ r, g, b }: RgbColor): HsvColor {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  let h = 0;
  if (delta !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else h = 60 * ((rn - gn) / delta + 4);
  }
  if (h < 0) h += 360;

  const s = max === 0 ? 0 : delta / max;
  const v = max;

  return { h, s, v };
}

export function labChroma({ a, b }: LabColor): number {
  return Math.sqrt(a * a + b * b);
}

/** Lab色空間のa,b平面上での色相角(度)。値が大きいほど黄み寄り、小さいほど赤紫寄り。 */
export function labHueAngleDeg({ a, b }: LabColor): number {
  let deg = (Math.atan2(b, a) * 180) / Math.PI;
  if (deg < 0) deg += 360;
  return deg;
}

export function rgbToHex({ r, g, b }: RgbColor): string {
  const toHex = (c: number): string =>
    Math.round(clamp(c, 0, 255))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
