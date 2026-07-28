import type { Point2D } from '../types';

export interface NormalizedLandmarkLike {
  x: number;
  y: number;
  z: number;
}

export interface SkinRegion {
  name: 'forehead' | 'leftCheek' | 'rightCheek' | 'chin';
  center: Point2D;
  radiusPx: number;
}

export interface HairRegion {
  center: Point2D;
  radiusPx: number;
}

export interface EyeRegions {
  left: { center: Point2D; radiusPx: number };
  right: { center: Point2D; radiusPx: number };
}

// 標準MediaPipe Face Mesh(468/478点)トポロジーの公開キーポイントマップに基づく、
// 各部位のおおよその中心を成すランドマークインデックス群。
// 正確な解剖学的境界ではなく「肌が写っている可能性が高い代表点」の集合として使用し、
// 個々の点の誤差は後段の頑健統計(外れ値除去+中央値)でカバーする。
const FOREHEAD_SEED_INDICES = [10, 108, 151, 337, 9, 336, 296, 107];
const LEFT_CHEEK_SEED_INDICES = [50, 101, 118, 119, 100, 126, 205, 206, 207, 187];
const RIGHT_CHEEK_SEED_INDICES = [280, 330, 347, 348, 329, 355, 425, 426, 427, 411];
const CHIN_SEED_INDICES = [152, 175, 199, 200, 201, 421];

const LEFT_EYE_OUTER = 33;
const RIGHT_EYE_OUTER = 263;
const LEFT_IRIS_INDICES = [468, 469, 470, 471, 472];
const RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477];

function toPixel(lm: NormalizedLandmarkLike, width: number, height: number): Point2D {
  return { x: lm.x * width, y: lm.y * height };
}

function centroid(points: Point2D[]): Point2D {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function pickPoints(
  landmarks: NormalizedLandmarkLike[],
  indices: number[],
  width: number,
  height: number,
): Point2D[] {
  const points: Point2D[] = [];
  for (const idx of indices) {
    const lm = landmarks[idx];
    if (lm) points.push(toPixel(lm, width, height));
  }
  return points;
}

function distance(a: Point2D, b: Point2D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** 目頭外側同士の距離を顔スケールの基準として用いる */
function faceScale(landmarks: NormalizedLandmarkLike[], width: number, height: number): number {
  const left = landmarks[LEFT_EYE_OUTER];
  const right = landmarks[RIGHT_EYE_OUTER];
  if (!left || !right) return Math.min(width, height) * 0.2;
  return distance(toPixel(left, width, height), toPixel(right, width, height));
}

export function extractSkinRegions(
  landmarks: NormalizedLandmarkLike[],
  width: number,
  height: number,
): SkinRegion[] {
  const scale = faceScale(landmarks, width, height);
  // 経験的係数: 頬・額・顎の肌領域を髪の生え際や輪郭線に被らない範囲でカバーする半径
  const radiusPx = scale * 0.22;

  const seeds: [SkinRegion['name'], number[]][] = [
    ['forehead', FOREHEAD_SEED_INDICES],
    ['leftCheek', LEFT_CHEEK_SEED_INDICES],
    ['rightCheek', RIGHT_CHEEK_SEED_INDICES],
    ['chin', CHIN_SEED_INDICES],
  ];

  return seeds.map(([name, indices]) => {
    const points = pickPoints(landmarks, indices, width, height);
    const center = points.length > 0 ? centroid(points) : { x: width / 2, y: height / 2 };
    return { name, center, radiusPx };
  });
}

/**
 * Face Meshは髪の生え際より上を追跡しないため、額の最上点からさらに上方向へ
 * 外挿して髪サンプル領域を推定する(近似)。前髪で隠れている場合は精度が下がるため、
 * 呼び出し側でサンプル数が少ない場合は「検出不可」として扱う。
 */
export function extractHairRegion(
  landmarks: NormalizedLandmarkLike[],
  width: number,
  height: number,
): HairRegion | null {
  const top = landmarks[10];
  const chin = landmarks[152];
  if (!top || !chin) return null;

  const topPx = toPixel(top, width, height);
  const chinPx = toPixel(chin, width, height);
  const faceHeight = distance(topPx, chinPx);

  const center: Point2D = { x: topPx.x, y: topPx.y - faceHeight * 0.35 };
  if (center.y < 0) return null;

  const scale = faceScale(landmarks, width, height);
  return { center, radiusPx: scale * 0.2 };
}

export function extractEyeRegions(
  landmarks: NormalizedLandmarkLike[],
  width: number,
  height: number,
): EyeRegions | null {
  // 468点モデルには虹彩ランドマークが含まれないため、その場合は瞳サンプルを諦める
  if (landmarks.length < 478) return null;

  const leftPoints = pickPoints(landmarks, LEFT_IRIS_INDICES, width, height);
  const rightPoints = pickPoints(landmarks, RIGHT_IRIS_INDICES, width, height);
  if (leftPoints.length === 0 || rightPoints.length === 0) return null;

  const scale = faceScale(landmarks, width, height);
  const radiusPx = scale * 0.06;

  return {
    left: { center: centroid(leftPoints), radiusPx },
    right: { center: centroid(rightPoints), radiusPx },
  };
}
