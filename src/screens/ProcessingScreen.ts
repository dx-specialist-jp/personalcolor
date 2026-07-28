import { renderShell } from '../app/Layout';
import { h } from '../utils/dom';

export function renderProcessingScreen(): HTMLElement {
  const spinner = h('div', {
    class:
      'h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700 dark:border-slate-700 dark:border-t-blue-400',
    role: 'status',
    'aria-hidden': 'true',
  });

  const content = h(
    'section',
    { class: 'flex flex-1 flex-col items-center justify-center text-center' },
    [
      spinner,
      h('p', { class: 'mt-6 text-base font-semibold', 'aria-live': 'polite' }, [
        '端末内でAI解析しています…',
      ]),
      h('p', { class: 'mt-2 text-sm text-slate-500 dark:text-slate-400' }, [
        '顔検出 → 肌色抽出 → 色空間解析 → シーズン判定',
      ]),
      h('p', { class: 'mt-1 text-xs text-slate-400 dark:text-slate-500' }, [
        '画像は送信されていません。すべてこのブラウザ内で処理中です。',
      ]),
    ],
  );

  return renderShell([content]);
}
