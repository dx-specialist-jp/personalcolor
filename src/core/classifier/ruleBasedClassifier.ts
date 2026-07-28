import { SEASON_LABELS_JA } from './types';
import type { Classifier, ClassificationResult, FeatureVector, Season } from '../../types';

interface SeasonIdeal {
  warmCool: number;
  value: number;
  chroma: number;
}

// 4シーズン理論における各シーズンの理想的な特徴量座標(暖色/寒色, 明度, 鮮やかさ)。
// Spring=暖色+明るい+クリア, Summer=寒色+明るい+ソフト,
// Autumn=暖色+深い+ソフト, Winter=寒色+深い+クリア という標準的な定義に基づく。
const SEASON_IDEALS: Record<Season, SeasonIdeal> = {
  spring: { warmCool: 1, value: 1, chroma: 1 },
  summer: { warmCool: -1, value: 1, chroma: -1 },
  autumn: { warmCool: 1, value: -1, chroma: -1 },
  winter: { warmCool: -1, value: -1, chroma: 1 },
};

// softmax温度: 小さいほど1シーズンに確信度が偏り、大きいほど僅差になる
const SOFTMAX_TEMPERATURE = 0.9;

function euclideanDistance(a: SeasonIdeal, b: SeasonIdeal): number {
  return Math.sqrt(
    (a.warmCool - b.warmCool) ** 2 + (a.value - b.value) ** 2 + (a.chroma - b.chroma) ** 2,
  );
}

function buildExplanation(features: FeatureVector, season: Season): string[] {
  const lines: string[] = [];
  lines.push(
    features.warmCool >= 0
      ? '肌の色相はイエロー(黄み)寄りと判定しました。'
      : '肌の色相はブルー(青み)寄りと判定しました。',
  );
  lines.push(
    features.value >= 0
      ? '肌・髪の明度は明るめと判定しました。'
      : '肌・髪の明度は深め(暗め)と判定しました。',
  );
  lines.push(
    features.chroma >= 0
      ? '色の鮮やかさ(クリアさ)が高めと判定しました。'
      : '色の濁り(ソフトな質感)が高めと判定しました。',
  );
  lines.push(`総合診断: ${SEASON_LABELS_JA[season]}`);
  return lines;
}

export class RuleBasedClassifier implements Classifier {
  classify(features: FeatureVector): ClassificationResult {
    const point: SeasonIdeal = {
      warmCool: features.warmCool,
      value: features.value,
      chroma: features.chroma,
    };

    const seasons = Object.keys(SEASON_IDEALS) as Season[];
    const similarities = seasons.map((season) => {
      const distance = euclideanDistance(point, SEASON_IDEALS[season]);
      return { season, similarity: Math.exp(-distance / SOFTMAX_TEMPERATURE) };
    });
    const total = similarities.reduce((sum, s) => sum + s.similarity, 0);

    const scores = Object.fromEntries(
      similarities.map(({ season, similarity }) => [season, similarity / total]),
    ) as Record<Season, number>;

    const best = similarities.reduce((a, b) => (b.similarity > a.similarity ? b : a));

    return {
      season: best.season,
      scores,
      features,
      explanation: buildExplanation(features, best.season),
    };
  }
}
