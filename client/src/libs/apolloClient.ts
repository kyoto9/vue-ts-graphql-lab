// 役割: Apollo Client の作成。HTTP 経由で GraphQL サーバに接続し、結果をキャッシュする。
import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core'


export const apolloClient = new ApolloClient({
    // HttpLink: GraphQL サーバの URL を指定
    link: new HttpLink({ uri: import.meta.env.VITE_GRAPHQL_ENDPOINT }),
    // InMemoryCache: 取得したデータをメモリ上に保存→同じデータを使い回して高速化
    cache: new InMemoryCache(),
})