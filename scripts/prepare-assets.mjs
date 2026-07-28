// ビルド/開発起動前に実行するアセット準備スクリプト。
//
// 本サイトは「画像は端末内のみで処理し、外部通信は行わない」ことを訴求している。
// そのため MediaPipe の WASMランタイムとモデルファイルを、npm/CDN実行時フェッチに
// 任せるのではなく、ビルド時（GitHub Actions等、開発者の手元）に取得して
// public/ 配下へ同一オリジンの静的アセットとして配置する。
// これによりランタイム（ユーザーのブラウザ）は自ドメインの静的ファイルしか読み込まない。
import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const WASM_SRC_DIR = path.join(rootDir, 'node_modules/@mediapipe/tasks-vision/wasm');
const WASM_DEST_DIR = path.join(rootDir, 'public/mediapipe/wasm');
const WASM_FILES = [
  'vision_wasm_internal.js',
  'vision_wasm_internal.wasm',
  'vision_wasm_nosimd_internal.js',
  'vision_wasm_nosimd_internal.wasm',
];

const MODEL_DEST_DIR = path.join(rootDir, 'public/models');
const MODEL_DEST_PATH = path.join(MODEL_DEST_DIR, 'face_landmarker.task');
// Google公式ホスティング（MediaPipe Model Maker配布元）。float16量子化版で軽量(約3.7MB)。
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task';

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyWasmAssets() {
  await mkdir(WASM_DEST_DIR, { recursive: true });
  for (const file of WASM_FILES) {
    const dest = path.join(WASM_DEST_DIR, file);
    if (await exists(dest)) continue;
    await copyFile(path.join(WASM_SRC_DIR, file), dest);
    console.log(`[prepare-assets] copied ${file}`);
  }
}

async function downloadModel() {
  await mkdir(MODEL_DEST_DIR, { recursive: true });
  if (await exists(MODEL_DEST_PATH)) {
    console.log('[prepare-assets] face_landmarker.task already present, skipping download');
    return;
  }
  console.log('[prepare-assets] downloading face_landmarker.task ...');
  const response = await fetch(MODEL_URL);
  if (!response.ok || !response.body) {
    throw new Error(`モデルのダウンロードに失敗しました: HTTP ${String(response.status)}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  await import('node:fs/promises').then((fs) => fs.writeFile(MODEL_DEST_PATH, buffer));
  console.log(`[prepare-assets] saved face_landmarker.task (${String(buffer.byteLength)} bytes)`);
}

await copyWasmAssets();
await downloadModel();
