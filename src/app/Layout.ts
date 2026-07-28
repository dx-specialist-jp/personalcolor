import { h } from '../utils/dom';
import { toggleTheme } from '../utils/theme';

export function renderShell(content: Node[]): HTMLElement {
  const skipLink = h(
    'a',
    {
      href: '#main-content',
      class:
        'skip-link rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white focus-visible:outline-white',
    },
    ['本文へスキップ'],
  );

  const themeToggleBtn = h(
    'button',
    {
      type: 'button',
      class:
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg leading-none text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
      'aria-label': 'ダークモード / ライトモードを切り替え',
    },
    ['🌓'],
  );
  themeToggleBtn.addEventListener('click', () => {
    toggleTheme();
  });

  const header = h(
    'header',
    {
      class:
        'sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80',
    },
    [
      h('span', { class: 'text-sm font-semibold tracking-tight' }, ['AIパーソナルカラー診断']),
      themeToggleBtn,
    ],
  );

  // tabindex=-1: 画面遷移のたびにJS側でここへフォーカスを移し、
  // スクリーンリーダー利用者にも新しい画面内容を確実に伝える(SPAのフォーカス管理)
  const main = h(
    'main',
    {
      id: 'main-content',
      tabindex: -1,
      class: 'mx-auto flex w-full max-w-md flex-1 flex-col px-4 py-8',
    },
    content,
  );

  const footer = h(
    'footer',
    { class: 'px-4 py-8 text-center text-xs leading-relaxed text-slate-400 dark:text-slate-500' },
    ['画像は端末内のみで処理され、サーバーには一切送信・保存されません。'],
  );

  return h(
    'div',
    {
      class:
        'flex min-h-screen flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100',
    },
    [skipLink, header, main, footer],
  );
}
