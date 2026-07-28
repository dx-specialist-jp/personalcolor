# AIパーソナルカラー診断 (personalcolor)

写真から4シーズン(イエベ春 / ブルベ夏 / イエベ秋 / ブルベ冬)のパーソナルカラーを診断するWebアプリです。

**すべての画像処理はブラウザ内(端末内)だけで完結します。写真がサーバーへアップロードされることは一切ありません。** GitHub Pagesだけで動く完全サーバーレス・無料・オンデバイスAI構成です。

- 🔒 画像は一切アップロードされない・保存されない
- 💰 ランニングコスト0円(従量課金APIなし)
- 📱 スマホ / PC 両対応、ダークモード対応
- 🧠 MediaPipe Face Landmarker(オンデバイスAI)による顔検出 + ルールベースの色空間解析

## デモ

`main`ブランチへのpushで自動的に以下へデプロイされます。

```
https://<your-github-username>.github.io/personalcolor/
```

## プライバシーについて

- 画像はネットワーク越しに一切送信されません。アップロード後の解析(顔検出・色抽出・色空間変換・シーズン判定)はすべて`src/core/imagePipeline.ts`内でブラウザのメインスレッド上で実行されます。
- 診断結果はメモリ上にのみ保持され、`localStorage`/`IndexedDB`/Cookie等には保存されません。「もう一度診断する」やタブを閉じると画像への参照(Object URL)は破棄されます。
- MediaPipeのWASMランタイム・顔検出モデルは、ビルド時(GitHub Actions実行時)にpublic/へ取得して同一オリジンから配信します。実行時に外部ドメインへ通信することはありません([scripts/prepare-assets.mjs](./scripts/prepare-assets.mjs)参照)。

## 技術スタック

| 分類                   | 技術                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| ビルド                 | Vite 8 / TypeScript 6 (strict)                                                                                                 |
| スタイリング           | Tailwind CSS 4                                                                                                                 |
| 顔検出(オンデバイスAI) | [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker) (`@mediapipe/tasks-vision`) |
| HEIC変換               | `heic2any`                                                                                                                     |
| フォント               | Noto Sans JP(`@fontsource`で自己ホスト、OFLライセンス)                                                                         |
| Lint/Format            | ESLint(flat config) + typescript-eslint + Prettier                                                                             |
| デプロイ               | GitHub Actions → GitHub Pages                                                                                                  |

詳細な設計意図・アルゴリズムは [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) を参照してください。

## セットアップ

```bash
npm install
npm run dev       # 開発サーバー起動 (http://localhost:5173/personalcolor/)
```

初回`npm run dev`/`npm run build`時に、`scripts/prepare-assets.mjs`がMediaPipeのWASM(約22MB)とモデルファイル(約3.7MB)を`public/`配下へ自動ダウンロードします(`public/mediapipe/`, `public/models/`はgit管理外)。

## ビルド・検証コマンド

```bash
npm run build        # 型チェック + 本番ビルド (dist/ に出力)
npm run preview       # ビルド成果物をローカルでプレビュー
npm run typecheck     # 型チェックのみ
npm run lint          # ESLint
npm run lint:fix
npm run format         # Prettier整形
npm run format:check
```

## GitHub Pagesへのデプロイ手順

1. このリポジトリを自分のGitHubアカウントへpushする。
2. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** に設定する。
3. `main`ブランチへpushすると[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)が自動実行され、lint→型チェック→ビルド→デプロイされる。
4. 別リポジトリ名で運用する場合は、[vite.config.ts](./vite.config.ts)の`base`をリポジトリ名に合わせて変更すること。

## ディレクトリ構成

```
src/
├── main.ts                 # エントリーポイント
├── app/                    # 画面遷移(状態機械)・共通レイアウト
├── screens/                # 画面ごとのUI(Home/Guidance/Upload/Processing/Result/Error)
├── core/                   # 顔検出・色抽出・特徴量計算・シーズン判定のロジック本体
│   └── classifier/         # 判定器(ルールベース。Phase3でONNX版に差し替え可能な抽象)
├── data/                   # シーズンごとの色・服・髪色などの提案データ
├── types/                  # 共有型定義
└── utils/                  # DOMヘルパー、画像処理ユーティリティ等
scripts/prepare-assets.mjs  # MediaPipe資産の自己ホスト化スクリプト
docs/ARCHITECTURE.md        # アーキテクチャ・アルゴリズム詳細
```

## アクセシビリティ

[デジタル庁デザインシステム](https://design.digital.go.jp/)が公開している方針(JIS X 8341-3:2016 レベルAA準拠目標、Noto Sans JP採用、本文16px以上・行高150%以上、タップターゲット44px以上、8pxベースのスペーシング)に沿って実装しています。

- スキップリンク、画面遷移時のフォーカス移動(SPAのフォーカス管理)
- 各画面1つの`h1`から始まる正しい見出し階層
- 色だけに依存しない情報伝達(カラースウォッチには常にHEX値を併記)
- `:focus-visible`による明示的なフォーカスリング
- ライト/ダーク両対応のコントラスト確保

ただし、デジタル庁デザインシステムの正式なカラートークン等はFigmaでのみ配布されており本リポジトリで完全再現しているわけではありません。上記の公開されている原則・ガイドラインに準拠する設計、という位置づけです。

## 診断精度について

本アプリはOpenAI等の従量課金APIを使わず、無料で運営できることを最優先した設計です。そのため「オンデバイスの顔検出(MediaPipe)」+「色空間解析(Lab/HSV)」+「ルールベース分類」を組み合わせたハイブリッド方式を採用しています。照明条件・写真の質により結果が変動するため、診断結果画面では判定根拠(スコア内訳・抽出色)を可視化し、参考情報として提示しています。詳細アルゴリズムは[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)を参照してください。

## ロードマップ

- **Phase2**: 12タイプ診断への拡張、髪色/瞳色抽出精度の向上、複数枚撮影の平均化
- **Phase3**: ラベル付きデータに基づくONNX Runtime Web軽量モデルの導入、髪色/服色シミュレーション、メイク提案、顔タイプ・骨格診断

## ライセンス

このリポジトリ自体のライセンスはプロジェクト運用者の判断で設定してください。使用しているOSSライブラリ(MediaPipe: Apache-2.0, heic2any: MIT, Noto Sans JP: SIL OFL 1.1 等)のライセンス表記は各パッケージに従います。
