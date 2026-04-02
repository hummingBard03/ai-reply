# クソリプほいほい — プロジェクト概要

X（旧Twitter）風UIで、投稿に対してAIキャラクターがクソリプを返すWebアプリ。

## 技術スタック

- React 18 + TypeScript + Vite
- Tailwind CSS
- Anthropic Claude API（`claude-sonnet-4-6`）、ブラウザから直接呼び出し
- 環境変数: `VITE_ANTHROPIC_API_KEY`（`.env` に設定）

## ファイル構成

```
src/
├── types.ts          # 型定義（Character, Reply, AppState）
├── characters.ts     # 20キャラクターの定義、pickRandomCharacters(n)
├── api.ts            # generateReplies(tweet, characters[]) — 1回のAPIコールで全員分生成
├── App.tsx           # 状態管理のルート
├── index.css         # fadeInアニメーション定義
└── components/
    ├── TweetInput.tsx  # 投稿UI（140文字制限、Cmd+Enterで送信）
    ├── TweetCard.tsx   # 投稿済みツイート＋「もう一回」ボタン
    └── ReplyList.tsx   # リプライ一覧（フェードイン）
```

## 重要な設計方針

- **APIコールは1回だけ**: 10キャラ分のクソリプを1つのプロンプトにまとめて生成し、`[キャラID]\n返信テキスト` 形式でパース
- **キャラ抽選**: 毎回20種からランダムに10体を重複なしで選ぶ（`pickRandomCharacters(10)`）
- **キャラ定義の追加・変更は `src/characters.ts` のみ**。`id` はパースのキーになるため英数字スネークケースで一意に保つこと

## 作業ルール

- **機能追加・変更のたびに `README.md` の更新要否を確認し、必要なら更新する**

## 開発

```bash
npm run dev    # http://localhost:5173
npm run build
```
