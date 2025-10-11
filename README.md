# vue-ts-graphql-lab

学習用の Vue 3 + TypeScript + GraphQL (Apollo) サンプル。UI と BFF を対にして、GraphQL の往復を最短ステップで体験することを目的としています。

## プロジェクト概要
- Web フロント (`client/`): Vue 3 + Vite + Apollo Client。Todo の一覧・追加・状態切り替え・削除を行う最小構成の SPA。
- GraphQL BFF (`server/`): Apollo Server 5。メモリ上の Todo ストアを扱う resolver を提供します。
- Docker 開発 (`compose.yaml`): Node 20 ベースのコンテナで client/server を並列起動します。

## ドキュメントガイド
- `docs/開発環境構成.md`: 必要なツール、環境変数、開発サーバー起動手順をまとめています。
- `docs/フロー解説.md`: Vue コンポーネントから GraphQL resolver までのリクエストフローとシーケンス図を掲載しています。
- `docs/使用ツール.md`: 利用している主要ライブラリと補助ツールの選定理由を整理しています。

## ローカルセットアップ
1. 事前確認  
   `node -v` と `npm -v` で Node.js 20 系 / npm 10 系を確認します。バージョンが異なる場合は Volta や nvm-windows で切り替えてください。
2. 依存関係のインストール  
   `cd client && npm install`  
   `cd server && npm install`
3. 開発サーバーの起動  
   - `cd server && npm run dev` (GraphQL: http://localhost:4000/graphql)  
   - 別ターミナルで `cd client && npm run dev` (UI: http://localhost:5173)
4. ビルド確認  
   - フロント: `cd client && npm run build && npm run preview`  
   - サーバー: `cd server && npm run build && npm run start`

## Docker で試す
Docker Desktop と Docker Compose を用意し、リポジトリのルートで実行します。

```bash
docker compose up -d --build
```

- UI: http://localhost:5173  
- GraphQL: http://localhost:4000/graphql  
- 環境変数 `VITE_GRAPHQL_URL` は Compose 内で `http://server:4000/graphql` に設定されています。別ホストへ切り替える場合は `client/.env` で上書きしてください。

停止は `docker compose down`。キャッシュから作り直す場合は `docker compose build --no-cache` を併用します。

## 開発時のチェック
- Todo の追加 / 状態切り替え / 削除が UI と GraphQL の往復で正しく反映されること。
- `npm run build` (client と server) が成功すること。
- 依存を更新した場合は `package-lock.json` の差分を確認し、ドキュメントへ影響範囲を記載すること。

## ディレクトリ構成
```text
vue-ts-graphql-lab/
├─ client/            # Vue 3 + Vite + Apollo Client
│  ├─ src/main.ts     # エントリーポイント
│  ├─ src/App.vue     # Todo 画面
│  ├─ src/lib/apollo.ts
│  └─ src/graphql/    # Query / Mutation 定義
├─ server/            # Apollo Server (standalone)
│  └─ src/index.ts
├─ docs/              # 詳細ドキュメント群
├─ compose.yaml       # docker compose 設定
└─ README.md
```

## 貢献ガイド
- Conventional Commits (例: `feat(client): ...`) を遵守してください。
- 変更内容に応じて `README.md` や `docs/*.md` を更新し、手動確認手順を残してください。
- スキーマを変更した場合は、クエリの再生成が必要なことを PR 説明に明記します。

## 参考ドキュメント
- フロー全体: [フロー解説](docs/フロー解説.md)
- 環境情報: [開発環境構成](docs/開発環境構成.md)
- ツール: [使用ツール](docs/使用ツール.md)
