import {
  renderExtractedSwatch,
  renderListSection,
  renderSwatchRow,
} from './components/ColorSections';
import { renderScoreBars } from './components/ScoreBars';
import type { AppActions } from '../app/App';
import { renderShell } from '../app/Layout';
import { SEASON_PALETTES } from '../data/seasonPalettes';
import type { DiagnosisResult } from '../types';
import { h } from '../utils/dom';

export function renderResultScreen(app: AppActions, result: DiagnosisResult): HTMLElement {
  const { classification, regionSamples, warnings, previewObjectUrl } = result;
  const palette = SEASON_PALETTES[classification.season];

  const heroSection = h('section', { class: 'flex items-center gap-4' }, [
    h('img', {
      src: previewObjectUrl,
      alt: 'アップロードした写真のプレビュー(端末内のみで表示・保存はされません)',
      class: 'h-24 w-24 rounded-xl object-cover shadow-sm',
    }),
    h('div', {}, [
      h('p', { class: 'text-xs font-semibold text-blue-700 dark:text-blue-400' }, ['診断結果']),
      h('h1', { class: 'text-2xl font-bold' }, [`${palette.emoji} ${palette.nameJa}`]),
      h('p', { class: 'mt-1 text-sm text-slate-600 dark:text-slate-300' }, [palette.catchphrase]),
    ]),
  ]);

  const sections: HTMLElement[] = [heroSection];

  if (warnings.length > 0) {
    sections.push(
      h(
        'div',
        {
          class:
            'mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200',
        },
        [
          h('p', { class: 'font-semibold' }, ['⚠️ 精度に関する注意']),
          ...warnings.map((w) => h('p', { class: 'mt-1' }, [w])),
        ],
      ),
    );
  }

  sections.push(
    h('section', { class: 'mt-6' }, [
      h('h2', { class: 'text-sm font-bold' }, ['4シーズン スコア内訳']),
      renderScoreBars(classification.scores),
    ]),
  );

  sections.push(
    h('div', { class: 'mt-6' }, [renderSwatchRow(palette.colors, 'おすすめカラーパレット')]),
  );

  const extractedSwatches = [renderExtractedSwatch('肌', regionSamples.skinAverage)];
  if (regionSamples.eyeAverage)
    extractedSwatches.push(renderExtractedSwatch('瞳', regionSamples.eyeAverage));
  if (regionSamples.hair) extractedSwatches.push(renderExtractedSwatch('髪', regionSamples.hair));
  sections.push(
    h('section', { class: 'mt-6' }, [
      h('h2', { class: 'text-sm font-bold' }, ['あなたから抽出した色']),
      h('div', { class: 'mt-2 flex gap-4' }, extractedSwatches),
    ]),
  );

  sections.push(
    h('div', { class: 'mt-6 grid grid-cols-1 gap-6' }, [
      renderListSection('似合う服', palette.clothing),
      renderListSection('似合う髪色', palette.hairColors),
      renderListSection('アクセサリー', palette.accessories),
      renderListSection('おすすめコーデ', palette.coordinateIdeas),
    ]),
  );

  sections.push(
    h('div', { class: 'mt-6' }, [renderSwatchRow(palette.avoid, '避けたほうがよい色')]),
  );

  sections.push(
    h(
      'section',
      {
        class:
          'mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-700 dark:bg-slate-900 dark:text-slate-200',
      },
      [
        h('h2', { class: 'text-sm font-bold' }, ['判定の根拠']),
        h(
          'ul',
          { class: 'mt-2 space-y-1 pl-4' },
          classification.explanation.map((line) => h('li', { class: 'list-disc' }, [line])),
        ),
        h('p', { class: 'mt-3 text-xs text-slate-400' }, [
          '※ 本診断はルールベースの画像解析による簡易判定です。照明・写真の質により結果が変わる場合があります。',
        ]),
      ],
    ),
  );

  const retryBtn = h(
    'button',
    {
      type: 'button',
      class:
        'mt-8 w-full rounded-xl bg-blue-700 px-6 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-blue-600',
    },
    ['もう一度診断する'],
  );
  retryBtn.addEventListener('click', () => {
    app.reset();
  });
  sections.push(retryBtn);

  return renderShell([h('section', {}, sections)]);
}
