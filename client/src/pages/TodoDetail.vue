<script setup lang="ts">
    // 役割: 1件分の詳細表示。URLの :id を受け取り、その id のデータだけ取得。
    import { computed } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useQuery } from '@vue/apollo-composable'
    import GetTodoById from '@/graphql/GetTodoById.gql'

    const route = useRoute() // 現在のURL情報（/todo/:id の id を取り出す）
    const router = useRouter()

    // route.params.id は文字列 or undefined の可能性 → 文字列に寄せる
    const id = computed(() => String(route.params.id ?? ''))

    // variables に id を渡して 1件だけ取得
    const { result, loading, error } = useQuery(GetTodoById, { id: id.value })

    const goBack = () => router.back() // 1つ前のページに戻る（一覧へ）
</script>

<template>
    <div>
        <button @click="goBack">← 戻る</button>

        <div v-if="loading">読み込み中...</div>
        <div v-else-if="error">エラー: {{ error.message }}</div>

        <div v-else>
            <h1>Todo 詳細</h1>
            <p><strong>ID:</strong> {{ result?.todo?.id }}</p>
            <p><strong>タイトル:</strong> {{ result?.todo?.title }}</p>
            <p><strong>説明:</strong> {{ result?.todo?.description ?? '（なし）' }}</p>

            <p style="margin-top: 16px; color: gray;">
            ※ 一覧へ戻ると、一覧は <strong>キャッシュ</strong> から即表示されます。
            ネットワーク通信を待たないので、体感が速くなります。
            </p>
        </div>
    </div>
</template>