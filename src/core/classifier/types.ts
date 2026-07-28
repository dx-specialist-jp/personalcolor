export type { Classifier, ClassificationResult, FeatureVector, Season } from '../../types';

export const SEASON_LABELS_JA: Record<import('../../types').Season, string> = {
  spring: 'イエベ春(スプリング)',
  summer: 'ブルベ夏(サマー)',
  autumn: 'イエベ秋(オータム)',
  winter: 'ブルベ冬(ウィンター)',
};
