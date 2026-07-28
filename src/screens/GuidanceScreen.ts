import type { AppActions } from '../app/App';
import { renderShell } from '../app/Layout';
import { h } from '../utils/dom';

const TIPS: { icon: string; text: string }[] = [
  { icon: '☀️', text: '自然光の下で撮影する(直射日光や強いフラッシュは避ける)' },
  { icon: '🧴', text: 'ノーメイクまたは薄めのメイクで撮影する' },
  { icon: '🎨', text: '白い壁など無地の背景を選ぶ' },
  { icon: '💇', text: '前髪を上げて額を出す' },
  { icon: '🚫', text: '写真加工・フィルターアプリはOFFにする' },
];

export function renderGuidanceScreen(app: AppActions): HTMLElement {
  const list = h(
    'ul',
    { class: 'mt-4 space-y-3' },
    TIPS.map((tip) =>
      h(
        'li',
        {
          class:
            'flex items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800',
        },
        [
          h('span', { class: 'text-xl', 'aria-hidden': 'true' }, [tip.icon]),
          h('span', { class: 'text-sm leading-relaxed text-slate-700 dark:text-slate-200' }, [
            tip.text,
          ]),
        ],
      ),
    ),
  );

  const backBtn = h(
    'button',
    {
      type: 'button',
      class:
        'flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900',
    },
    ['戻る'],
  );
  backBtn.addEventListener('click', () => {
    app.goHome();
  });

  const nextBtn = h(
    'button',
    {
      type: 'button',
      class:
        'flex-[2] rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600',
    },
    ['写真をアップロードする'],
  );
  nextBtn.addEventListener('click', () => {
    app.goUpload();
  });

  const content = h('section', {}, [
    h('h1', { class: 'text-xl font-bold' }, ['撮影前のご案内']),
    h('p', { class: 'mt-1 text-sm text-slate-600 dark:text-slate-300' }, [
      '診断精度を高めるため、以下のポイントを確認してから撮影・アップロードしてください。',
    ]),
    list,
    h('div', { class: 'mt-6 flex gap-3' }, [backBtn, nextBtn]),
  ]);

  return renderShell([content]);
}
