# Vite + Vue + TypeScript + GraphQL (Apollo) 超入門セットアップ手順

> **ねらい**: 画面のボタン操作 → GraphQL サーバへリクエスト → サーバで処理 → 結果が JSON で返る → 画面へ反映、という“往復”を最短構成で体験します。**プログラムが読めない方**でもわかるよう、各コマンドの意味を丁寧に説明します。

---

## 0. 完成イメージ（処理の流れ）

1. **Vue画面でボタンを押す**
2. 画面のコードが **Apollo Client** を使って **GraphQL** の `Query/Mutation` を作って送信
3. ブラウザが **HTTP POST** で `http://localhost:4000/graphql` へ JSON を送る
4. Node.js 上の **Apollo Server** がリクエストを受け取り、**resolver(処理)** を実行
5. サーバーの結果を **JSON** でブラウザへ返す
6. 画面は返ってきた JSON を受け取り、**自動的に表示が更新**される

---

## 1. 事前準備（インストール確認）

* 必要: **Node.js 18 以上**（LTS 推奨）、ターミナル(コマンド実行画面)

```bash
node -v   # Node.js のバージョン表示（例: v20.x）
npm -v    # npm のバージョン表示（例: 10.x）
```

* バージョンが表示されればOK。出なければ Node.js をインストールしてください。

---

## 2. ひな型の作成（プロジェクトと最小構成）

以下は **丸ごとコピペ**でOKです。`#` から右は“説明”なのでそのまま貼って大丈夫です。

```bash
# ① 作業用フォルダを作って入る
mkdir vue-ts-graphql-lab && cd vue-ts-graphql-lab

# ② フロントエンド(画面)用フォルダを作って入る
mkdir client && cd client

# ③ Vite+Vue+TypeScript のテンプレートを流し込む
#    - Vite: 高速な開発サーバ
#    - Vue: 画面を作るフレームワーク
#    - TypeScript: 型付きJavaScript（エラーを早めに気づける）
npm create vite@latest . -- --template vue-ts

# ④ フロントで使うライブラリを入れる
#    - graphql: GraphQL の文法・型
#    - @apollo/client: ブラウザ側のGraphQLクライアント
#    - @vue/apollo-composable: Vue用のApollo連携フック
npm install graphql @apollo/client @vue/apollo-composable

# ⑤ いったんルートに戻る
cd ..

# ⑥ バックエンド(サーバ)用フォルダを作って入る
mkdir server && cd server

# ⑦ Nodeの初期化（package.jsonを作成）。-y は全質問にYesの意味
npm init -y

# ⑧ サーバに必要なライブラリを導入
#    - @apollo/server: GraphQLサーバ本体（Apollo Server v4）
#    - graphql: スキーマ定義に必要
#    - typescript/ts-node/型定義: TSでサーバを書いて実行
npm install @apollo/server graphql
npm install -D typescript ts-node @types/node

# ⑨ TypeScript 初期化（tsconfig.json を自動生成）
npx tsc --init

# ⑩ ルートに戻る（これで client/ と server/ の2つが並ぶ状態）
cd ..
```

> ここまでで **client/**（フロント） と **server/**（バックエンド） の2つのフォルダができました。

---

## 3. 仕上がりのフォルダ構成（目安）

```
vue-ts-graphql-lab/
├─ client/                  # 画面（Vite + Vue + TypeScript）
│  ├─ index.html
│  ├─ src/
│  │  ├─ main.ts
│  │  ├─ App.vue
│  │  ├─ lib/apollo.ts      # Apollo Clientの設定
│  │  └─ graphql/
│  │      ├─ queries.ts     # 読み取り(Query)
│  │      └─ mutations.ts   # 書き込み(Mutation)
│  └─ ...
└─ server/                  # GraphQLサーバ（Apollo Server v4）
   ├─ package.json
   ├─ tsconfig.json
   └─ src/index.ts          # スキーマと処理（resolver）
```

---

## 4. サーバを起動する（バックエンド）

> 先に **server** を起動します。フロントはこのURLに向かって通信します。

```bash
# サーバ側に移動
cd server

# ① package.json に“開発起動コマンド”を追加（エディタで開いて scripts をこうします）
# {
#   "type": "module",
#   "scripts": {
#     "dev": "node --loader ts-node/esm src/index.ts"
#   }
# }

# ② サーバを起動（TypeScriptのまま実行）
npm run dev
```

* 成功すると、ターミナルに `🚀 Server ready at: http://localhost:4000/` と出ます。
* このURLが **通信先** です（フロントからここへPOST）。

> **補足**: `Ctrl + C` で停止できます。

---

## 5. フロントを起動する（Vite開発サーバ）

> 次に **client** を起動します。画面がブラウザに表示されます。

```bash
# ルートへ戻り client に移動
cd .. && cd client

# ① Vite を起動（自動でブラウザが開く場合あり）
npm run dev
```

* 画面URL: 例 `http://localhost:5173/`
* 画面の「追加」「切替」などの操作に応じて、**自動的にサーバと通信→画面更新**が行われます。

> **停止**: ターミナルの `Ctrl + C` で止まります。

---

## 6. よくあるつまずき（Q&A）

* **ポートが使われている**

  * 症状: 起動時にエラー（Port already in use など）
  * 対策: 4000（サーバ）や 5173（フロント）を他アプリが使っていないか確認。使っていれば片方のポート番号を変更。

* **CORS エラー**（ブラウザのセキュリティ警告）

  * 症状: ブラウザのコンソールに `CORS` という文言が出る
  * 対策: 今回の `@apollo/server/standalone` はデフォルト許可設定が入っており基本OK。別ポート/ホストに変更した場合は設定を見直す。

* **型エラー（赤線）**

  * 症状: エディタで TypeScript のエラーが出る
  * 対策: `import` の綴りや、定義したファイルパス、変数名の打ち間違いを確認。保存し直して再ビルド。

* **サーバURLが違う**

  * 症状: 画面は開くがデータが出ない
  * 対策: `client/src/lib/apollo.ts` の `uri` が `http://localhost:4000/graphql` になっているか確認。

---

## 7. 片付け（停止・再起動）

* **サーバ側**のターミナル: `Ctrl + C`
* **フロント側**のターミナル: `Ctrl + C`
* 再起動したい場合は、それぞれのフォルダで `npm run dev` を再実行します。

---

## 8. 次のステップ

* Todo に説明文や作成日時などのフィールドを追加 → サーバの `typeDefs` を修正 → クライアントのクエリも更新
* エラー時のユーザー通知（`useMutation` の `onError`, 画面にメッセージ表示）
* 単体テストの導入（フロント: Vitest、サーバ: Jest など）
* 永続化（本物のDB使用: SQLite / PostgreSQL など）にステップアップ

---

### 参考（短い“意味辞典”）

* **GraphQL**: サーバに「どんな形のデータが欲しいか」を**宣言**して、必要な形のJSONを受け取れる仕組み
* **Query**: 読み取り（例: Todo一覧をください）
* **Mutation**: 書き込み（例: Todoを追加/更新/削除してください）
* **Resolver**: 具体的な処理（配列に追加する、DBから読む等）
* **Apollo Client**: ブラウザでGraphQLを扱いやすくするツール（通信・キャッシュ管理）
* **Vite**: 超高速なフロント開発サーバ
* **TypeScript**: 型のあるJavaScript（間違いを事前に防ぎやすい）
