export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface LabColor {
  l: number;
  a: number;
  b: number;
}

export interface HsvColor {
  h: number;
  s: number;
  v: number;
}

/** 領域から抽出した代表色。rgbはスウォッチ表示用、lab/hsvは特徴量計算用。 */
export interface ColorSample {
  rgb: RgbColor;
  lab: LabColor;
  hsv: HsvColor;
  /** サンプリングに使われた有効ピクセル数。少なすぎる場合は信頼度が低い。 */
  sampleCount: number;
}

export interface Point2D {
  x: number;
  y: number;
}

export interface FaceRegionSamples {
  forehead: ColorSample;
  leftCheek: ColorSample;
  rightCheek: ColorSample;
  chin: ColorSample;
  /** 額・両頬・顎の統合肌色 */
  skinAverage: ColorSample;
  hair: ColorSample | null;
  leftEye: ColorSample | null;
  rightEye: ColorSample | null;
  eyeAverage: ColorSample | null;
}

/** ルールベース判定に使う正規化済み特徴量 */
export interface FeatureVector {
  /** -1(ブルベ寄り) 〜 +1(イエベ寄り) */
  warmCool: number;
  /** -1(深い/暗い) 〜 +1(明るい) */
  value: number;
  /** -1(ソフト/濁り) 〜 +1(クリア/鮮やか) */
  chroma: number;
  /** 0〜1 肌と髪・瞳のコントラスト */
  contrast: number;
  /** 0〜1 肌の彩度(HSV S) */
  saturation: number;
  /** 0〜100 肌の明度(Lab L*) */
  lightness: number;
}

export interface ClassificationResult {
  season: Season;
  /** 4シーズンそれぞれのスコア(合計約1になる相対確信度) */
  scores: Record<Season, number>;
  features: FeatureVector;
  explanation: string[];
}

/** 分類器の抽象。Phase3でONNX Runtime Web版に差し替え可能にする */
export interface Classifier {
  classify: (features: FeatureVector) => ClassificationResult;
}

export interface SeasonPalette {
  season: Season;
  nameJa: string;
  emoji: string;
  catchphrase: string;
  colors: string[];
  clothing: string[];
  hairColors: string[];
  accessories: string[];
  avoid: string[];
  coordinateIdeas: string[];
}

export interface DiagnosisResult {
  classification: ClassificationResult;
  regionSamples: FaceRegionSamples;
  warnings: string[];
  /** UI表示用のプレビュー(端末内メモリ上のみで保持し、保存はしない) */
  previewObjectUrl: string;
}
