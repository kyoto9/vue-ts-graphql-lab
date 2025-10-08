# vue-ts-graphql-lab セットアップ手順（学習用：Vue + TS + GraphQL / Web & BFF 分離）

> 目的：フロント（Vue 3 + TypeScript + Vite + Apollo Client）と BFF（Apollo Server）を **Docker で並走** させ、最小の GraphQL クエリ往復までを短時間で再現できる学習用環境を構築する。

---

## 0. リポジトリ概要

* リポジトリ名（例）：`vue-ts-graphql-lab`
* 説明（Description 例）：

  * *Vue 3 + TypeScript + Vite（Web）と Apollo Server（GraphQL BFF）を分離構成で学ぶためのリポジトリ。Docker Compose で web と bff を並走し、最小の GraphQL クエリを往復させます。*

---

## 1. ディレクトリ構成（最小）

```
vue-ts-graphql-lab/
├─ apps/
│  ├─ web/        # Vue 3 + TS + Vite + Apollo Client
│  │  └─ src/
│  │     ├─ main.ts
│  │     └─ App.vue
│  └─ bff/        # Apollo Server (Express)
│     └─ index.mjs
├─ docker/
│  ├─ web.Dockerfile
│  └─ bff.Dockerfile
├─ docker-compose.yml
├─ .gitattributes         # * text=auto eol=lf で LF 統一（推奨）
├─ .gitignore
└─ README.md
```

---

## 2. 改行コード（EOL）ポリシー

* **推奨**：リポジトリは **LF 統一**。
* 設定例：`.gitattributes`

  ```gitattributes
  * text=auto eol=lf
  ```
* 既存ファイルをポリシーに合わせて正規化：

  ```bash
  git add --renormalize .
  git commit -m "chore: enforce LF via .gitattributes"
  ```
* 参考：現在の設定確認

  ```bash
  git config --get core.autocrlf      # 例: true/false
  git check-attr eol -- README.md     # 例: eol: unspecified / lf
  ```

---

## 3. Web（Vue + TS + Vite + Apollo Client）初期化

1. Vite テンプレ生成（`apps/web`）

```bash
cd apps/web
npm create vite@latest . -- --template vue-ts
```

2. GraphQL クライアント導入（**互換バージョン**）

```bash
npm i @apollo/client@^3.9 @vue/apollo-composable@^4 graphql@^16 graphql-tag@^2
# 例：npm i @apollo/client@3.9.9 @vue/apollo-composable@4.2.2 graphql@16.8.1 graphql-tag@2.12.6
```

> メモ：`@vue/apollo-composable@4` は `@apollo/client@3` を要求。`@apollo/client@4` を入れると peer-deps 競合で `ERESOLVE` が発生。

3. 最小コード

* `apps/web/src/main.ts`

  ```ts
  import { createApp } from 'vue'
  import App from './App.vue'
  import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core'
  import { DefaultApolloClient } from '@vue/apollo-composable'

  const apollo = new ApolloClient({
    link: createHttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql' }),
    cache: new InMemoryCache(),
  })

  createApp(App).provide(DefaultApolloClient, apollo).mount('#app')
  ```
* `apps/web/src/App.vue`

  ```vue
  <template>
    <p v-if="loading">Loading...</p>
    <p v-else-if="error">Error: {{ error.message }}</p>
    <p v-else>Hello from GraphQL: {{ data?.hello }}</p>
  </template>

  <script setup lang="ts">
  import { gql } from 'graphql-tag'
  import { useQuery } from '@vue/apollo-composable'

  const HELLO = gql`query { hello }`
  const { loading, error, result: data } = useQuery(HELLO)
  </script>
  ```
* optional: `apps/web/.env.development`

  ```env
  VITE_GRAPHQL_URL=http://localhost:4000/graphql
  ```

> この時点で `apps/web/package.json` と `apps/web/package-lock.json` が生成される。

---

## 4. BFF（Apollo Server）初期化

1. 依存導入（`apps/bff`）

```bash
# プロジェクトルートに移動
mkdir -p apps/bff
cd apps/bff
# package.json を“質問なしで”デフォルト値で作るコマンドです（-y＝yes to all）
npm init -y
npm i graphql @apollo/server express cors body-parser
```

2. `package.json` 最小例

```json
{
  "name": "bff",
  "version": "1.0.0",
  "type": "module",
  "scripts": { "dev": "node index.mjs" }
}
```

3. `apps/bff/index.mjs`

```js
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

const typeDefs = `#graphql
  type Query { hello: String! }
`
const resolvers = { Query: { hello: () => 'Hello GraphQL 👋' } }

const server = new ApolloServer({ typeDefs, resolvers })
await server.start()

const app = express()
app.use(cors())
app.use('/graphql', bodyParser.json(), expressMiddleware(server))

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`GraphQL ready at http://localhost:${port}/graphql`))
```

> ここでも `apps/bff/package.json` と `apps/bff/package-lock.json` が揃う。

---

## 5. Docker 構成

### 5-1. `docker/web.Dockerfile`

```dockerfile
FROM node:20
WORKDIR /app

COPY apps/web/package*.json ./
RUN npm ci

COPY apps/web ./

EXPOSE 5173
CMD ["npm","run","dev","--","--host","0.0.0.0"]
```

### 5-2. `docker/bff.Dockerfile`

```dockerfile
FROM node:20
WORKDIR /app

COPY apps/bff/package*.json ./
RUN npm ci

COPY apps/bff ./

EXPOSE 4000
CMD ["npm","run","dev"]
```

### 5-3. `docker-compose.yml`

```yaml
services:
  bff:
    build:
      context: .
      dockerfile: docker/bff.Dockerfile
    ports:
      - "4000:4000"

  web:
    build:
      context: .
      dockerfile: docker/web.Dockerfile
    environment:
      - VITE_GRAPHQL_URL=http://bff:4000/graphql
    ports:
      - "5173:5173"
    depends_on:
      - bff
```

> メモ：`web` からは Compose 内 DNS で `http://bff:4000/graphql` に到達可能。

---

## 6. 起動・確認

```bash
# プロジェクトルートで
docker compose up -d --build

# 動作確認
# Web: http://localhost:5173
# BFF: http://localhost:4000/graphql
```

---

## 7. よくあるエラーと対処

* **`npm ci` が失敗（EUSAGE / lockfile 無し）**

  * 原因：`package-lock.json` が無い。
  * 対処：ローカルで `npm i` を実行し lock を生成してから Docker ビルド。

* **`ERESOLVE`（peer-deps 競合）**

  * 原因：`@vue/apollo-composable@4` は `@apollo/client@3` を要求、`@apollo/client@4` を入れた。
  * 対処：`npm i @apollo/client@^3.9 @vue/apollo-composable@^4 graphql@^16 graphql-tag@^2`

* **改行コードの警告（LF/CRLF）**

  * 対処：`.gitattributes` に `* text=auto eol=lf` を設定 → `git add --renormalize .` → commit。

* **ポート競合**

  * 対処：`docker-compose.yml` の `ports` を変更（例：`5174:5173` / `4001:4000`）。

---

## 8. 参考コミットメッセージ例

* 構築観点（Web にクライアント導入）

  ```
  feat(web): GraphQLクライアント環境を導入（Vue+TS）

  - Apollo Client/GraphQL を追加
  - package-lock.json を生成（再現性担保）
  ```
* 依存競合の解消

  ```
  fix(web): peer-deps 競合を解消（@apollo/client@3 系に合わせる）
  ```
* LF 統一

  ```
  chore: enforce LF via .gitattributes (git add --renormalize .)
  ```

---

## 9. 次の一歩（発展）

* GraphQL Schema を拡張（Query/Mutation/型追加）
* GraphQL Code Generator で **型安全なクエリ呼び出し**
* エラーハンドリング方針・キャッシュポリシーの実験
* 逆プロキシ（Nginx 等）や JWT 認証の導入
* ESLint/Prettier/tsconfig の共通化、モノレポ化（workspaces）

---

以上で、ここまで実施した **セットアップ内容の要約** と **再現手順** は完了です。
