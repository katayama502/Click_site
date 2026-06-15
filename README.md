# Click かんたんガイド

ノーコードアプリ作成ツール **[Click](https://click.dev)** の使い方を、**高校生・非エンジニアのスタッフ**でも理解できるようにまとめた、**検索付きの解説サイト**です。

公式マニュアル（[manual.click.dev](https://manual.click.dev/6426cda9c36c47b9a198a99f3368f39a)）と公式YouTube（[@Clicknocode](https://www.youtube.com/@Clicknocode)）の情報をもとに自動生成しています。

## できること

- 🔍 **検索** … 「ボタン」「ログイン」「いいね」など、やりたいことばで解説と動画を一発検索
- 🎯 **目的から探す** … 「ログイン機能をつける」「決済する」などの目的別カード
- 🗂️ **カテゴリで探す** … はじめに／エレメント／機能実装／FAQ など16カテゴリ・**148件の解説**
- 📝 **やさしい手順** … 各機能を手順・注意点つきで平易な日本語に書き直し
- 🎬 **動画で学ぶ** … 公式YouTube **42本**をテーマ別に整理し、サイト内に埋め込み再生
- 📘 各解説から**公式マニュアルの該当ページ**へワンクリック

## 使い方（開く）

### かんたん（そのまま開く）
`index.html` をダブルクリックしてブラウザで開くだけで動きます。
（データは `assets/data.js` に埋め込み済みなので、サーバー不要です）

### ローカルサーバーで開く場合
```bash
npx serve -l 4321 .
# → http://localhost:4321 をブラウザで開く
```

## 公開（デプロイ）したいとき

このフォルダ一式をそのままアップロードするだけで公開できます（ビルド不要の静的サイト）。
- **Netlify / Vercel** … フォルダをドラッグ＆ドロップ、または連携してデプロイ
- **GitHub Pages** … リポジトリに置いて Pages を有効化

## ファイル構成

```
Click/
├─ index.html          … サイト本体
├─ assets/
│  ├─ style.css        … デザイン
│  ├─ app.js           … 検索・表示ロジック
│  └─ data.js          … 解説148件＋動画42本のデータ（自動生成）
├─ data/               … 元データ・生成スクリプト（更新用）
│  ├─ content.json     … 解説データ
│  ├─ videos.json      … 動画データ
│  └─ pages.json       … マニュアルのページ一覧
└─ README.md
```

## データの更新について

`data/` 内の JSON を編集したあと、以下で `assets/data.js` を作り直せます。

```bash
node -e 'const fs=require("fs");const t=require("./data/content.json"),v=require("./data/videos.json");fs.writeFileSync("assets/data.js","window.CLICK_TOPICS="+JSON.stringify(t)+";\nwindow.CLICK_VIDEOS="+JSON.stringify(v)+";\n")'
```

---
※ 本サイトは学習用の非公式まとめです。最新・正確な情報は必ず公式マニュアルをご確認ください。
# Click_site
