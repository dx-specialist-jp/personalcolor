import { SEASON_LABELS_JA } from '../../core/classifier/types';
import type { Season } from '../../types';
import { h } from '../../utils/dom';

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter'];

export function renderScoreBars(scores: Record<Season, number>): HTMLElement {
  const rows = SEASON_ORDER.map((season) => {
    const pct = Math.round(scores[season] * 100);
    return h('div', { class: 'flex items-center gap-3' }, [
      h('span', { class: 'w-28 shrink-0 text-xs text-slate-600 dark:text-slate-300' }, [
        SEASON_LABELS_JA[season],
      ]),
      h(
        'div',
        { class: 'h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800' },
        [h('div', { class: 'h-full rounded-full bg-blue-600', style: `width:${String(pct)}%` })],
      ),
      h('span', { class: 'w-10 shrink-0 text-right text-xs tabular-nums text-slate-500' }, [
        `${String(pct)}%`,
      ]),
    ]);
  });
  return h('div', { class: 'mt-3 space-y-2' }, rows);
}
