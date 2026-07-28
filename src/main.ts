// デジタル庁デザインシステムの推奨フォント「Noto Sans JP」を自己ホスト(OFLライセンス、外部CDN通信なし)。
// JS側でimportすることでViteのアセット処理(ハッシュ付与・dist同梱)が正しく適用される。
import '@fontsource/noto-sans-jp/400.css';
import '@fontsource/noto-sans-jp/500.css';
import '@fontsource/noto-sans-jp/700.css';
import './style.css';
import { App } from './app/App';
import { initTheme } from './utils/theme';

initTheme();

const rootEl = document.getElementById('app');
if (!rootEl) throw new Error('#app 要素が見つかりません');

const app = new App(rootEl);
app.start();
