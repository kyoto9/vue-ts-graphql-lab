// 役割: とても小さな GraphQL サーバ。メモリ配列に Todo を保持。
// DB は使わず「処理の流れ」を理解するための最短サンプルです。
import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

// GraphQL の型定義（スキーマ）。
// - Query: 読み取り（一覧、1件）
// - Mutation: 更新（追加）
const typeDefs = `#graphql
    type Todo {
        id: ID!
        title: String!
        description: String
    }

    type Query {
        todos: [Todo!]! # 一覧
        todo(id: ID!): Todo # 1件取得
    }

    type Mutation {
    addTodo(title: String!, description: String): Todo!
    }
`

// データ置き場（メモリ）。実運用では DB の役割。
let todos = [
    { id: '1', title: '牛乳を買う', description: '帰りにスーパーで' },
    { id: '2', title: 'メール返信', description: null },
]

// Resolver: クライアントから来た Query/Mutation に応じて実処理を行う
const resolvers = {
    Query: {
        todos: () => {
        // 一覧をそのまま返す
        return todos
        },
        todo: (_: unknown, args: { id: string }) => {
        // id に一致するものを探して返す（無ければ null）
        return todos.find(t => t.id === args.id) ?? null
        },
    },
    Mutation: {
        addTodo: (_: unknown, args: { title: string; description?: string | null }) => {
            // 新規 ID を発行（ここでは配列長+1 の簡易ロジック）
            const newTodo = {
                id: String(todos.length + 1),
                title: args.title,
                description: args.description ?? null,
            }
            // 配列にプッシュ（= データ追加）
            todos.push(newTodo)
            // 追加した要素を返す（クライアントのキャッシュ更新に使われる）
            return newTodo
        },
    },
}

// Apollo Server の起動
const server = new ApolloServer({ typeDefs, resolvers })

// 4000 番で待ち受け。/graphql エンドポイントが生える。
startStandaloneServer(server, { listen: { port: 4000 } }).then(({ url }) => {
    console.log(`🚀 GraphQL ready at ${url}`)
})