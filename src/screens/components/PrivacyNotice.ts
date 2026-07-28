import { h } from '../../utils/dom';

export function renderPrivacyNotice(): HTMLElement {
  return h(
    'div',
    {
      class:
        'rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
      role: 'note',
    },
    [
      h('p', { class: 'font-semibold' }, ['🔒 プライバシーについて']),
      h('p', { class: 'mt-1 leading-relaxed' }, [
        '写真は一切サーバーへアップロードされません。診断はすべてこの端末(ブラウザ)内だけで処理されます。',
      ]),
      h('p', { class: 'mt-1 leading-relaxed' }, [
        '診断が終わると画像データへの参照は破棄され、localStorage等にも保存されません。タブを閉じれば端末上にも残りません。',
      ]),
    ],
  );
}
