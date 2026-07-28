import { RuleBasedClassifier } from './classifier/ruleBasedClassifier';
import { averageColorSamples, sampleRegionColor } from './colorSampling';
import { detectFaceLandmarks } from './faceLandmarker';
import { extractFeatureVector } from './featureExtraction';
import { convertHeicToJpeg, isHeicFile } from './heic';
import { applyGrayWorldWhiteBalance } from './lightingCorrection';
import { extractEyeRegions, extractHairRegion, extractSkinRegions } from './regionExtraction';
import { drawToCanvas, loadImageBitmapFromFile } from '../utils/image';
import type { DiagnosisResult, FaceRegionSamples } from '../types';

const MIN_VALID_SAMPLE_COUNT = 6;

export class NoFaceDetectedError extends Error {
  constructor() {
    super('顔を検出できませんでした。正面を向いた明るい写真で再度お試しください。');
    this.name = 'NoFaceDetectedError';
  }
}

const classifier = new RuleBasedClassifier();

/**
 * アップロードされた1枚の写真から診断結果までを組み立てるオーケストレーター。
 * すべての処理はこの関数呼び出し元(ブラウザのメインスレッド上)で完結し、
 * 画像データがネットワーク越しに送信されることはない。
 */
export async function runDiagnosis(file: File): Promise<DiagnosisResult> {
  const warnings: string[] = [];

  const normalizedFile = isHeicFile(file) ? await convertHeicToJpeg(file) : file;
  const previewObjectUrl = URL.createObjectURL(normalizedFile);

  let bitmap: ImageBitmap;
  try {
    bitmap = await loadImageBitmapFromFile(normalizedFile);
  } catch (error) {
    URL.revokeObjectURL(previewObjectUrl);
    throw error;
  }
  const canvas = drawToCanvas(bitmap);
  bitmap.close();

  const { landmarks } = await detectFaceLandmarks(canvas);
  if (!landmarks) {
    URL.revokeObjectURL(previewObjectUrl);
    throw new NoFaceDetectedError();
  }

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas 2D コンテキストの取得に失敗しました');
  const rawImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const correctedImageData = applyGrayWorldWhiteBalance(rawImageData);

  const skinRegions = extractSkinRegions(landmarks, canvas.width, canvas.height);
  const skinSampleByName = new Map(
    skinRegions.map((region) => [region.name, sampleRegionColor(correctedImageData, region)]),
  );
  const forehead = skinSampleByName.get('forehead');
  const leftCheek = skinSampleByName.get('leftCheek');
  const rightCheek = skinSampleByName.get('rightCheek');
  const chin = skinSampleByName.get('chin');
  if (!forehead || !leftCheek || !rightCheek || !chin) {
    URL.revokeObjectURL(previewObjectUrl);
    throw new Error('肌領域の色抽出に失敗しました');
  }

  const skinAverage = averageColorSamples([forehead, leftCheek, rightCheek, chin]);
  if (skinAverage.sampleCount < MIN_VALID_SAMPLE_COUNT) {
    warnings.push('肌の色を十分に検出できませんでした。明るい場所で撮影し直すと精度が向上します。');
  }

  const hairRegion = extractHairRegion(landmarks, canvas.width, canvas.height);
  const hair = hairRegion ? sampleRegionColor(correctedImageData, hairRegion) : null;
  if (!hair) {
    warnings.push('髪色を検出できませんでした(前髪が下りていると推定精度が下がります)。');
  }

  const eyeRegions = extractEyeRegions(landmarks, canvas.width, canvas.height);
  const leftEye = eyeRegions ? sampleRegionColor(correctedImageData, eyeRegions.left) : null;
  const rightEye = eyeRegions ? sampleRegionColor(correctedImageData, eyeRegions.right) : null;
  const eyeAverage = leftEye && rightEye ? averageColorSamples([leftEye, rightEye]) : null;
  if (!eyeAverage) {
    warnings.push('瞳の色を検出できませんでした。');
  }

  const regionSamples: FaceRegionSamples = {
    forehead,
    leftCheek,
    rightCheek,
    chin,
    skinAverage,
    hair,
    leftEye,
    rightEye,
    eyeAverage,
  };

  const features = extractFeatureVector(regionSamples);
  const classification = classifier.classify(features);

  return { classification, regionSamples, warnings, previewObjectUrl };
}
