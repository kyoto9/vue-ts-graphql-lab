/**
 * ファイル: server/src/index.ts
 * 目的:
 *  - 最小の GraphQL サーバを起動する
 *  - 「今あるTodo一覧を取得する(Query)」「新しいTodoを追加する(Mutation)」を用意
 *  - メモリ配列を“なんちゃってDB”として利用（超入門用）
 *
 * 動作の流れ（超ざっくり）:
 *  1) スキーマ(typeDefs)で「どんなデータ型があり、どんな操作ができるか」を宣言
 *  2) リゾルバ(resolvers)で「操作の中身（ロジック）」を書く
 *  3) Apollo Server を起動すると、/graphql でHTTPリクエストを待ち受ける
 *  4) フロント(ブラウザ)からJSONでリクエストが来ると、該当リゾルバが実行され、JSONで結果が返る
 */

import { ApolloServer } from "@apollo/server"; // GraphQLサーバ本体
import { startStandaloneServer } from "@apollo/server/standalone"; // Express不要の簡易起動

// --------------------------------------------
// 1) 「どんなデータか」を宣言（GraphQLスキーマ）
// --------------------------------------------
const typeDefs = /* GraphQL */ `
  # Todoという“データの形”を定義
  type Todo {
    id: ID!       # 一意なID（! は「必ず値がある」= null不可）
    title: String! # タイトル文字列
    done: Boolean! # 完了したかどうか
  }

  # 画面側から「読み取り」で呼ぶ操作（GET的なイメージ）
  type Query {
    # Todo一覧を配列で返す
    todos: [Todo!]!
  }

  # 画面側から「書き込み」で呼ぶ操作（POST的なイメージ）
  type Mutation {
    # 新しいTodoを追加して、その追加されたTodoを返す
    addTodo(title: String!): Todo!
    # Todoの完了状態を切り替える
    toggleTodo(id: ID!): Todo!
    # 削除したTodoを返す
    deleteTodo(id: ID!): Todo!
  }
`;

// --------------------------------------------
// 2) “なんちゃってDB”（実運用ではDBに保存する）
// --------------------------------------------
type Todo = { id: string; title: string; done: boolean };

// 最初から2件だけ入れておく（初回表示のため）
const store: Todo[] = [
  { id: "1", title: "最初のタスク", done: false },
  { id: "2", title: "GraphQLを動かす", done: true },
];

// --------------------------------------------
// 3) 「操作の中身」を実装（resolver）
// --------------------------------------------
const resolvers = {
  Query: {
    // todos クエリが呼ばれたら、この関数が実行される
    todos: () => {
      // ここではstore配列をそのまま返すだけ
      return store;
    },
  },
  Mutation: {
    // addTodo(title: String!): Todo!
    addTodo: (_parent: unknown, args: { title: string }) => {
      // 引数 args.title は画面から送られてくる文字列
      const newTodo: Todo = {
        id: String(store.length + 1), // 簡易的に配列長+1をIDにする
        title: args.title,
        done: false,
      };
      store.push(newTodo); // 配列に追加
      return newTodo; // 追加したものを返す
    },
    // toggleTodo(id: ID!): Todo!
    toggleTodo: (_parent: unknown, args: { id: string }) => {
      // 配列からid一致の要素を探す
      const t = store.find((x) => x.id === args.id);
      if (!t) {
        // 見つからなければエラー（GraphQLはこれもJSONで返してくれる）
        throw new Error("Todoが見つかりません");
      }
      t.done = !t.done; // true/false をひっくり返す
      return t;
    },
    // deleteTodo(id: ID!): Todo!
    deleteTodo: (_parent: unknown, args: { id: string }) => {
      // 配列から対象を探して削除
      const idx = store.findIndex((x) => x.id === args.id);
      if (idx === -1) throw new Error("Todoが見つかりません");
      const [removed] = store.splice(idx, 1); // 取り除いた要素を返す
      return removed;
    },
  },
};

// --------------------------------------------
// 4) サーバ起動
// --------------------------------------------
async function main() {
  // ApolloServerをスキーマ＆リゾルバで作る
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // “スタンドアローン”で簡単起動（CORSもよしなに設定される）
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 }, // 画面からは http://localhost:4000/graphql に向けてリクエストが飛ぶ
  });

  console.log(`🚀 Server ready at: ${url}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
