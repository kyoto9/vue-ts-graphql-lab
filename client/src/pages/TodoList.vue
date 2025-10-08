<script setup lang="ts">
    import AddTodo from '@/graphql/AddTodo.gql'
    import { useRouter } from 'vue-router'

    const router = useRouter() // 画面遷移用（詳細へ移動＆戻るはブラウザ機能）

    // 入力フォーム用のリアクティブ変数（入力の変化を自動でUIに反映）
    const newTitle = ref('')
    const newDesc = ref('')

    // useQuery: コンポーネントのマウント時にクエリが走る（= 一覧データ取得）
    // loading: 通信中フラグ / error: エラー情報 / result: 取得データ
    const { result, loading, error } = useQuery(GetTodos)

    // useMutation: データ更新系（今回は Todo 追加）
    const { mutate: addTodo } = useMutation(AddTodo, {
        // update: サーバから結果が返ってきた瞬間に、Apolloキャッシュを書き換える
        // → ネットワーク再取得なしで一覧に即反映（体感が速い）
        update(cache, { data }) {
            if (!data?.addTodo) return
            // 1) 既存の GetTodos キャッシュを読み出す
            const existing = cache.readQuery<{ todos: Array<{ id: string; title: string }> }>({ query: GetTodos })
            // 2) 新しい要素を末尾に追加して
            const newList = existing ? [...existing.todos, data.addTodo] : [data.addTodo]
            // 3) それを同じクエリの結果として書き戻す
            cache.writeQuery({ query: GetTodos, data: { todos: newList } })
        },
    })


    // 追加ボタン押下時の処理
    const onAdd = async () => {
        if (!newTitle.value.trim()) return // タイトルが空なら何もしない
        await addTodo({ variables: { title: newTitle.value, description: newDesc.value || null } })
        // 入力欄をリセット
        newTitle.value = ''
        newDesc.value = ''
    }


    // 詳細ページへ遷移（URLに id を含める）
    const goDetail = (id: string) => {
        router.push({ name: 'detail', params: { id } })
    }
</script>

<template>
    <!-- 通信中はローディング表示 -->
    <div v-if="loading">読み込み中...</div>

    <!-- エラーがあればメッセージ表示 -->
    <div v-else-if="error">エラー: {{ error.message }}</div>

    <!-- データ表示部分（result はリアクティブ → 中身が来たら自動で描画） -->
    <div v-else>
        <h1>Todo 一覧</h1>

        <!-- 追加フォーム -->
        <div style="margin: 12px 0;">
            <input v-model="newTitle" placeholder="タイトル" />
            <input v-model="newDesc" placeholder="説明（任意）" />
            <button @click="onAdd">追加</button>
        </div>

        <ul>
            <!-- result.todos は GraphQL の戻り値。key は差分更新のための識別子 -->
            <li v-for="t in result?.todos ?? []" :key="t.id">
                {{ t.title }}
                <button @click="goDetail(t.id)">詳細へ</button>
            </li>
        </ul>

        <p style="margin-top: 16px; color: gray;">
        ※ 一度取得した一覧は Apollo の <strong>メモリキャッシュ</strong> に保持されます。<br />
        詳細へ移動してから戻ったとき、<strong>即時表示</strong>されるのはこのキャッシュのおかげです。
        </p>
    </div>
</template>