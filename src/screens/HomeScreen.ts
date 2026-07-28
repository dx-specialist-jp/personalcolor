import { renderPrivacyNotice } from './components/PrivacyNotice';
import type { AppActions } from '../app/App';
import { renderShell } from '../app/Layout';
import { h } from '../utils/dom';

const FEATURES = [
  '写真をアップロードするだけで診断',
  'AIが顔・肌・瞳・髪の色を解析',
  '4シーズン診断で似合う色がわかる',
  '完全無料・登録不要',
];

export function renderHomeScreen(app: AppActions): HTMLElement {
  const startBtn = h(
    'button',
    {
      type: 'button',
      class:
        'mt-6 w-full rounded-xl bg-blue-700 px-6 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-blue-600 active:bg-blue-800',
    },
    ['診断をはじめる'],
  );
  startBtn.addEventListener('click', () => {
    app.goGuidance();
  });

  const featureList = h(
    'ul',
    { class: 'mt-6 space-y-2 text-sm text-slate-600 dark:text-slate-300' },
    FEATURES.map((feature) =>
      h('li', { class: 'flex items-start gap-2' }, [
        h('span', { 'aria-hidden': 'true' }, ['✅']),
        feature,
      ]),
    ),
  );

  const content = h('section', {}, [
    h('p', { class: 'text-sm font-semibold text-blue-700 dark:text-blue-400' }, [
      '無料 / サーバーレス / 完全オンデバイスAI',
    ]),
    h('h1', { class: 'mt-2 text-2xl font-bold tracking-tight' }, ['AIパーソナルカラー診断']),
    h('p', { class: 'mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300' }, [
      '顔写真からAIがイエベ/ブルベ・4シーズンタイプを診断し、似合う色・服・髪色を提案します。すべてブラウザ内で完結するオンデバイスAIです。',
    ]),
    featureList,
    startBtn,
    h('div', { class: 'mt-8' }, [renderPrivacyNotice()]),
  ]);

  return renderShell([content]);
}
