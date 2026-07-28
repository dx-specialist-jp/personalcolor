import { renderPrivacyNotice } from './components/PrivacyNotice';
import type { AppActions } from '../app/App';
import { renderShell } from '../app/Layout';
import { h } from '../utils/dom';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.heif'];

function validateFile(file: File): string | null {
  const name = file.name.toLowerCase();
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasAcceptedMime = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', ''].includes(
    file.type,
  );
  if (!hasAcceptedExtension && !hasAcceptedMime) {
    return 'jpg, png, heic, heif形式の画像を選択してください。';
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return 'ファイルサイズが大きすぎます(20MB以下にしてください)。';
  }
  return null;
}

export function renderUploadScreen(app: AppActions): HTMLElement {
  const errorText = h('p', {
    class: 'mt-3 hidden text-sm font-medium text-red-600 dark:text-red-400',
    role: 'alert',
  });

  const showError = (message: string): void => {
    errorText.textContent = message;
    errorText.classList.remove('hidden');
  };

  const handleFile = (file: File | undefined): void => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      showError(error);
      return;
    }
    errorText.classList.add('hidden');
    void app.processFile(file);
  };

  const galleryInput = h('input', {
    type: 'file',
    accept: 'image/jpeg,image/png,image/heic,image/heif,.heic,.heif',
    class: 'hidden',
    'aria-label': 'アルバムから写真を選択',
  });
  galleryInput.addEventListener('change', () => {
    handleFile(galleryInput.files?.[0]);
  });

  const cameraInput = h('input', {
    type: 'file',
    accept: 'image/jpeg,image/png,image/heic,image/heif,.heic,.heif',
    capture: 'user',
    class: 'hidden',
    'aria-label': '写真を撮影',
  });
  cameraInput.addEventListener('change', () => {
    handleFile(cameraInput.files?.[0]);
  });

  const dropZone = h(
    'div',
    {
      class:
        'mt-4 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 px-4 py-10 text-center transition dark:border-slate-700',
    },
    [
      h('span', { class: 'text-3xl', 'aria-hidden': 'true' }, ['📷']),
      h('p', { class: 'mt-3 text-sm text-slate-600 dark:text-slate-300' }, [
        '写真をドラッグ&ドロップ、またはボタンから選択してください',
      ]),
    ],
  );
  dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('border-blue-600', 'bg-blue-50', 'dark:bg-blue-950/30');
  });
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-blue-600', 'bg-blue-50', 'dark:bg-blue-950/30');
  });
  dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('border-blue-600', 'bg-blue-50', 'dark:bg-blue-950/30');
    handleFile(event.dataTransfer?.files[0]);
  });

  const cameraBtn = h(
    'button',
    {
      type: 'button',
      class:
        'w-full rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600',
    },
    ['写真を撮る'],
  );
  cameraBtn.addEventListener('click', () => {
    cameraInput.click();
  });

  const galleryBtn = h(
    'button',
    {
      type: 'button',
      class:
        'w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900',
    },
    ['アルバムから選ぶ'],
  );
  galleryBtn.addEventListener('click', () => {
    galleryInput.click();
  });

  const content = h('section', {}, [
    h('h1', { class: 'text-xl font-bold' }, ['写真をアップロード']),
    h('p', { class: 'mt-1 text-sm text-slate-600 dark:text-slate-300' }, [
      '正面を向いた顔写真1枚を選んでください(jpg / png / HEIC対応)。',
    ]),
    dropZone,
    h('div', { class: 'mt-4 space-y-3' }, [cameraBtn, galleryBtn]),
    galleryInput,
    cameraInput,
    errorText,
    h('div', { class: 'mt-8' }, [renderPrivacyNotice()]),
  ]);

  return renderShell([content]);
}
