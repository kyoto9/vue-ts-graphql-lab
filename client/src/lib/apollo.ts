/**
 * ファイル: client/src/lib/apollo.ts
 * 目的:
 *  - ブラウザ側(Apollo Client)の「接続設定」を1か所にまとめる
 *  - 「どこのURLに投げるの？（サーバはどこ？）」をここで指定
 *
 * 画面(main.ts)からこの設定を読み込んで、全コンポーネントで使えるようにする。
 */
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client/core";

const httpLink = new HttpLink({
  // サーバのエンドポイントURL（server側の startStandaloneServer のポートと合わせる）
  uri: "http://localhost:4000/",
});

// InMemoryCache: 返ってきたデータを「キャッシュ（手元のメモ）」に保存して再利用する仕組み
const cache = new InMemoryCache();

// これが“クライアント本体”
// - httpLink: どこへ送る？
// - cache: 返ってきたデータをどう覚える？
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});
