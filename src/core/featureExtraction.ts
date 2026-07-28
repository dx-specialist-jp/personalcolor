import { clamp, labChroma, labHueAngleDeg } from './colorSpace';
import type { FaceRegionSamples, FeatureVector } from '../types';

// 以下のピボット/レンジ定数は肌色計測の経験則に基づく暫定値であり、
// 臨床的に検証されたものではない。Phase3でラベル付きデータが集まり次第、
// 統計的にキャリブレーションし直すことを想定している。
const WARM_COOL_HUE_PIVOT_DEG = 58;
const WARM_COOL_HUE_RANGE_DEG = 18;

const VALUE_LIGHTNESS_PIVOT = 58;
const VALUE_LIGHTNESS_RANGE = 18;

const CHROMA_PIVOT = 22;
const CHROMA_RANGE = 10;

export function extractFeatureVector(samples: FaceRegionSamples): FeatureVector {
  const skin = samples.skinAverage;

  const hueAngle = labHueAngleDeg(skin.lab);
  const warmCool = clamp((hueAngle - WARM_COOL_HUE_PIVOT_DEG) / WARM_COOL_HUE_RANGE_DEG, -1, 1);

  const hairLightness = samples.hair?.lab.l;
  const blendedLightness =
    hairLightness !== undefined ? skin.lab.l * 0.7 + hairLightness * 0.3 : skin.lab.l;
  const value = clamp((blendedLightness - VALUE_LIGHTNESS_PIVOT) / VALUE_LIGHTNESS_RANGE, -1, 1);

  const skinChroma = labChroma(skin.lab);
  const chroma = clamp((skinChroma - CHROMA_PIVOT) / CHROMA_RANGE, -1, 1);

  const referenceForContrast = samples.hair ?? samples.eyeAverage;
  const contrastRaw =
    referenceForContrast !== null ? Math.abs(skin.lab.l - referenceForContrast.lab.l) / 100 : 0.5;
  const contrast = clamp(contrastRaw, 0, 1);

  return {
    warmCool,
    value,
    chroma,
    contrast,
    saturation: skin.hsv.s,
    lightness: skin.lab.l,
  };
}
