import { rgbToHex } from '../../core/colorSpace';
import type { ColorSample } from '../../types';
import { h } from '../../utils/dom';

export function renderSwatchRow(hexColors: string[], label: string): HTMLElement {
  // 色だけで情報を伝えないよう、円のスウォッチに加えてHEX値を必ず可視テキストで併記する
  const swatches = hexColors.map((hex) =>
    h('div', { class: 'flex flex-col items-center gap-1' }, [
      h('span', {
        class: 'h-10 w-10 rounded-full border border-black/10 shadow-sm dark:border-white/10',
        style: `background-color:${hex}`,
        'aria-hidden': 'true',
      }),
      h('span', { class: 'text-[10px] uppercase tabular-nums text-slate-400' }, [hex]),
    ]),
  );
  return h('div', {}, [
    h('h2', { class: 'text-sm font-bold' }, [label]),
    h('div', { class: 'mt-2 flex flex-wrap gap-3' }, swatches),
  ]);
}

export function renderListSection(title: string, items: string[]): HTMLElement {
  return h('div', {}, [
    h('h2', { class: 'text-sm font-bold' }, [title]),
    h(
      'ul',
      { class: 'mt-2 space-y-1 pl-4 text-sm text-slate-700 dark:text-slate-200' },
      items.map((item) => h('li', { class: 'list-disc' }, [item])),
    ),
  ]);
}

export function renderExtractedSwatch(label: string, sample: ColorSample): HTMLElement {
  const hex = rgbToHex(sample.rgb);
  return h('div', { class: 'flex flex-col items-center gap-1' }, [
    h('span', {
      class: 'h-12 w-12 rounded-full border border-black/10 shadow-sm dark:border-white/10',
      style: `background-color:${hex}`,
      'aria-hidden': 'true',
    }),
    h('span', { class: 'text-xs font-medium text-slate-600 dark:text-slate-300' }, [label]),
    h('span', { class: 'text-[10px] uppercase tabular-nums text-slate-400' }, [hex]),
  ]);
}
