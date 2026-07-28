import type { AppActions } from '../app/App';
import { renderShell } from '../app/Layout';
import { h } from '../utils/dom';

export function renderErrorScreen(app: AppActions, message: string): HTMLElement {
  const retryBtn = h(
    'button',
    {
      type: 'button',
      class:
        'mt-6 w-full rounded-xl bg-blue-700 px-6 py-3 text-center text-base font-semibold text-white shadow-sm transition hover:bg-blue-600',
    },
    ['別の写真でもう一度試す'],
  );
  retryBtn.addEventListener('click', () => {
    app.goUpload();
  });

  const content = h(
    'section',
    { class: 'flex flex-1 flex-col items-center justify-center text-center' },
    [
      h('span', { class: 'text-4xl', 'aria-hidden': 'true' }, ['⚠️']),
      h('h1', { class: 'mt-4 text-lg font-bold' }, ['診断できませんでした']),
      h(
        'p',
        { class: 'mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300', role: 'alert' },
        [message],
      ),
      retryBtn,
    ],
  );

  return renderShell([content]);
}
