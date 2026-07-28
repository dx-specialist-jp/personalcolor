import { defineConfig } from 'vite';

// GitHub Pages はプロジェクトページとして `https://<user>.github.io/<repo>/` で配信されるため、
// リポジトリ名をbaseパスに設定する。ユーザー/組織ページ（<user>.github.io）に変更する場合は '/' にする。
export default defineConfig({
  base: '/personalcolor/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
