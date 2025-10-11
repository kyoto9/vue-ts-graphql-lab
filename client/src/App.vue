<!--
ファイル: client/src/App.vue
目的:
 - 実際の“画面”を構成する
 - ボタン操作 → GraphQL呼び出し → 結果表示 の流れを最小コードで体験する
 - もし画面が「真っ白」になっても、どこで止まっているかを“ログ”で特定できるようにする

やっていること:
 1) 画面の最初に Query(GetTodos) を実行して一覧を表示
 2) 入力欄に文字を打って「追加」ボタン ⇒ Mutation(ADD_TODO)
 3) 一覧の各項目の「切替」ボタン ⇒ Mutation(TOGGLE_TODO)
 4) 結果は Apollo Client のキャッシュに反映 → Vue が自動で再描画
-->

<template>
  <!-- 画面の“土台”。max-width で横幅を抑えて読みやすく -->
  <main style="max-width: 720px; margin: 2rem auto; font-family: system-ui;">
    <h1>🎯 Vue + Apollo Client 超入門</h1>

    <!-- 1) Todoの追加フォーム -->
    <section style="margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="margin: 0 0 .5rem;">新しいTodoを追加</h2>

      <!-- v-model: 入力欄と変数 title を“自動で同期”する（双方向バインディング） -->
      <input
        v-model="title"
        type="text"
        placeholder="例) 牛乳を買う"
        style="padding: .5rem; width: 70%;"
      />

      <!-- :disabled は “ボタンを押せない条件”。追加中 or 空文字 のとき無効化 -->
      <button
        :disabled="adding || title.trim().length === 0"
        @click="onAdd"
        style="padding: .5rem 1rem; margin-left: .5rem;"
      >
        {{ adding ? "追加中..." : "追加" }}
      </button>

      <!-- 追加のエラーはここに赤字で表示 -->
      <p v-if="addError" style="color: red; margin-top: .5rem;">
        追加に失敗しました: {{ addError.message }}
      </p>
    </section>

    <!-- 2) Todo一覧の表示（Queryの結果を描画） -->
    <section style="margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="margin: 0 0 .5rem;">Todo 一覧</h2>

      <!-- 読み込み中の表示。最初の一瞬だけ出る想定 -->
      <p v-if="loading">読み込み中...</p>

      <!-- 取得エラー時は赤字で表示（例: サーバURLが違う/CORS/ネットワーク断） -->
      <p v-else-if="error" style="color: red;">取得に失敗しました: {{ error.message }}</p>

      <!-- データが取れた場合の表示 -->
      <ul v-else style="list-style: none; padding: 0;">
        <!-- v-for: 配列 todos を1件ずつ描画。:key は高速化と安定描画のための“識別子” -->
        <li
          v-for="t in todos"
          :key="t.id"
          style="display: flex; align-items: center; gap: .5rem; padding: .25rem 0;"
        >
          <!-- done が true のとき取り消し線で“完了”を表現 -->
          <span :style="{ textDecoration: t.done ? 'line-through' : 'none' }">
            {{ t.title }}
          </span>

          <!-- 状態切替ボタン（完了 ↔ 未完了） -->
          <button @click="onToggle(t.id)" style="padding: .25rem .5rem;">
            切替
          </button>

          <!-- 削除ボタン（押すと即座に消え、もし失敗なら戻す “楽観的UI”付き） -->
          <button @click="onDelete(t.id)" style="padding:.25rem .5rem; color:#b00;">削除</button>
        </li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
/**
 * <script setup> は Vue 3 の“簡潔に書けるモード”
 * - import した値や、ここで宣言した変数/関数は、そのまま template で使える
 * - “export default { ... }” を書く必要がない
 */

// 画面用のリアクティブ変数やユーティリティ
import { ref, computed, onMounted, watchEffect } from "vue";

// GraphQL 用のフック（useQuery/useMutation）
// - 画面から Apollo Client を“簡単に”呼び出せる
import { useQuery, useMutation } from "@vue/apollo-composable";

// 実際に使う GraphQL の定義（文字列クエリ）を import
import { GET_TODOS } from "./graphql/queries";
import { ADD_TODO, TOGGLE_TODO, DELETE_TODO } from "./graphql/mutations";

// --- 起動トレース（真っ白の原因切り分け用。落ち着いたら削除OK） ---
console.log("[App] module loaded");

// 入力欄の値（v-model とつながる）
// ref("初期値") で“リアクティブな箱”を作る。title.value に中身が入るが、template 内は .value 省略可
const title = ref("");

// 1) 一覧の取得: 画面が表示されたタイミングで自動実行
// - result: サーバから返ってきたデータ（例: result.value?.todos）
// - loading: 取得中フラグ（true/false）
// - error: 失敗時のエラー情報
// - refetch: 明示的に“取り直す”関数
const { result, loading, error, refetch } = useQuery(GET_TODOS);

// 取り出しやすいように“計算プロパティ”で配列を整形
// - result.value がまだ undefined の瞬間もあるため、?? [] で安全に“空配列”にしておく
const todos = computed(() => result.value?.todos ?? []);

// 2) 追加の Mutation
// - mutate: 実行関数（例: addTodo({ title: "買い物" })）
// - loading/error: それぞれ実行中フラグ/エラー（ボタン表示やエラーメッセージに使う）
// - update: サーバから返った新データをキャッシュ（手元のメモ）に反映する仕組み
const {
  mutate: addTodo,
  loading: adding,
  error: addError,
} = useMutation(ADD_TODO, {
  // “キャッシュ更新”の簡易例：返ってきた1件を一覧の末尾に足す
  update(cache, { data }) {
    const newItem = data?.addTodo;
    if (!newItem) return;

    // 既存の一覧をキャッシュから読む（なければ空配列）
    const existing: any = cache.readQuery({ query: GET_TODOS });

    // 新しい配列を作ってキャッシュに書き戻す → 画面が自動更新される
    cache.writeQuery({
      query: GET_TODOS,
      data: { todos: [...(existing?.todos ?? []), newItem] },
    });

    console.log("[GQL][ADD] cache updated:", newItem);
  },
});

// 3) 状態切替の Mutation
// - onDone: 成功後に呼ばれる“イベント”。ここでは refetch で一覧を取り直す（分かりやすさ重視）
const { mutate: toggleTodo, onDone } = useMutation(TOGGLE_TODO);
onDone(() => {
  console.log("[GQL][TOGGLE] done. refetching list...");
  refetch();
});

// 「追加」ボタンが押されたら呼ばれる関数
async function onAdd() {
  if (!title.value.trim()) return; // 空文字は無視
  try {
    console.log("[UI] add click:", title.value);
    await addTodo({ title: title.value.trim() }); // サーバへ送信（HTTP POST）
    title.value = ""; // 入力欄を空に戻す
  } catch (e) {
    console.error("[UI] add error:", e);
  }
}

// 「切替」ボタンが押されたら呼ばれる関数
async function onToggle(id: string) {
  try {
    console.log("[UI] toggle click:", id);
    await toggleTodo({ id }); // サーバへ送信（HTTP POST）
  } catch (e) {
    console.error("[UI] toggle error:", e);
  }
}

// ★ 削除（キャッシュからその場で消す = 画面が即時更新）
//   - optimisticResponse: サーバ応答前に「こうなるはず」という仮の結果を先に画面に反映
//   - update: キャッシュから対象IDの要素を取り除く
const { mutate: deleteTodo } = useMutation(DELETE_TODO, {
  update(cache, { data }) {
    const removed = data?.deleteTodo;
    if (!removed) return;
    const existing: any = cache.readQuery({ query: GET_TODOS });
    const next = (existing?.todos ?? []).filter((x: any) => x.id !== removed.id);
    cache.writeQuery({ query: GET_TODOS, data: { todos: next } });
  },
});
async function onDelete(id: string) {
  // 既存の行を即座に消したいので “楽観的UI” を使う
  await deleteTodo({
    id,
  }, {
    optimisticResponse: {
      deleteTodo: { __typename: "Todo", id, title: "", done: false },
    },
  });
}

// --- ここから下は “真っ白”時の切り分けログ（不要なら削除OK） ---

// 画面の初回描画が終わったら呼ばれる
onMounted(() => {
  console.log("[App] mounted");
});

// GraphQLの取得状況を“常に”覗く
watchEffect(() => {
  console.log("[GQL][LIST] loading:", loading.value, "error:", error.value);
  console.log("[GQL][LIST] data:", result.value?.todos);
});
</script>

<style scoped>
/* 見た目の微調整（本題ではないので最低限） */
</style>
