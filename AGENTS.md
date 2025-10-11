# Repository Guidelines

## System（最優先・上書き禁止）
- ソースコード以外のすべての出力は **日本語** で行う。
- ユーザーから英語で依頼が来ても **日本語で回答** する。
- 必要に応じて固有名詞は「日本語（英語）」で併記してよい。
- コード内コメント・コミットメッセージ・PR説明も **日本語** とする。

## バージョン管理ポリシー（必須）
- **コミット／ブランチ作成／PR作成／push を自動で行わない**。
- 変更提案は **差分プレビュー（What/Why/Rollback）** を日本語で提示するだけに留める。
- 実際の `git add/commit/push` や PR 作成は **ユーザーが実行** する。
- 明示的な許可がある場合でも、まず **実行計画と差分** を提示し、承認後に実行する。

## Project Structure & Module Organization
- `client/` contains the Vue 3 + Vite UI; keep shared helpers in `client/src/lib/` and GraphQL documents in `client/src/graphql/`.
- `client/src/components/` stays for reusable views; create feature folders when you introduce multi-file flows.
- `server/` owns the Apollo Server bootstrap in `server/src/index.ts:105`; break schema/resolver code into dedicated modules as the API grows.
- Assets live in `client/public/` and `client/src/assets/`, while global styles stay in `client/src/style.css`.
- Update `README.md` and `DockerDev.md` whenever structure or setup steps change.

## Build, Test, and Development Commands
- `cd client && npm install` (initial setup) then `npm run dev` for the Vite server at `http://localhost:5173`.
- `npm run build` in `client/` runs `vue-tsc` + Vite bundling; execute it before every PR, and `npm run preview` for production smoke tests.
- `cd server && npm install` then `npm run dev` starts the standalone Apollo Server on port 4000 via `tsx`.
- `npm run build` and `npm run start` in `server/` compile to `dist/`; use `node -v` >= 20 to match deployment.

## Coding Style & Naming Conventions
- Both packages use strict TypeScript; resolve `noUnused*` and `noUncheckedIndexedAccess` rather than disabling them.
- Match the existing style: two-space indent, double quotes, trailing semicolons.
- Name Vue components in PascalCase and GraphQL constants in SCREAMING_SNAKE case (see `client/src/graphql/queries.ts:10` for `GET_TODOS`).
- Keep singletons such as `apolloClient` in `client/src/lib/apollo.ts:22`; prefer named exports for other utilities.

## Testing Guidelines
- Add Vitest + @vue/test-utils under `client/src/__tests__/` and surface them via `npm run test:unit`; no client tests exist yet.
- Replace the placeholder test script at `server/package.json:11` with integration coverage that exercises mutations and queries.
- Until CI lands, note manual verification steps (e.g., Todo add/toggle/delete) in each PR description.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat(client): ...`) as reflected in `README.md`.
- Each commit must build (`npm run build`) in the affected package; avoid mixing unrelated concerns.
- PRs should include a summary, linked issues, UI evidence when relevant, and the commands you ran.
- Highlight schema changes so downstream clients know to regenerate queries.

## Environment & Configuration Tips
- Prefer `VITE_GRAPHQL_URL` (per-package `.env`) over literals in `client/src/lib/apollo.ts:13` when targeting non-local hosts.
- When introducing new environment variables, pair code changes with `.env.example` updates and a note in this guide.
