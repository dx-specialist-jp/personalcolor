import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

let landmarkerPromise: Promise<FaceLandmarker> | null = null;

/**
 * FaceLandmarkerはWASM初期化を含むため生成コストが高い。
 * シングルトンとしてキャッシュし、複数回の診断で使い回す。
 * wasm/モデルはいずれもビルド時に public/ へ自己ホストしたものを同一オリジンから読み込む
 * (scripts/prepare-assets.mjs参照)。ランタイムでの外部ネットワーク通信は発生しない。
 */
async function createLandmarker(delegate: 'GPU' | 'CPU'): Promise<FaceLandmarker> {
  const fileset = await FilesetResolver.forVisionTasks(`${import.meta.env.BASE_URL}mediapipe/wasm`);
  return await FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: `${import.meta.env.BASE_URL}models/face_landmarker.task`,
      delegate,
    },
    runningMode: 'IMAGE',
    numFaces: 1,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });
}

function getLandmarker(): Promise<FaceLandmarker> {
  landmarkerPromise ??= createLandmarker('GPU').catch(async (error: unknown) => {
    // 一部端末/ブラウザではWebGLベースのGPUデリゲートが利用できないため、CPUにフォールバックする
    console.warn('[faceLandmarker] GPUデリゲートの初期化に失敗、CPUで再試行します', error);
    return await createLandmarker('CPU');
  });
  return landmarkerPromise;
}

export interface FaceDetectionOutcome {
  landmarks: { x: number; y: number; z: number }[] | null;
}

export async function detectFaceLandmarks(
  source: HTMLCanvasElement,
): Promise<FaceDetectionOutcome> {
  const landmarker = await getLandmarker();
  const result = landmarker.detect(source);
  const first = result.faceLandmarks[0];
  return { landmarks: first ?? null };
}
