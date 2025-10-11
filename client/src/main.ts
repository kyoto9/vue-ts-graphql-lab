/**
 * ファイル: client/src/main.ts
 * 目的:
 *  - Vueアプリの“エントリーポイント”（最初に実行される場所）
 *  - ここで Apollo Client を “アプリ全体に提供” する
 *
 * 「提供(provide)」とは:
 *  - 子コンポーネント（App.vueなど）から、Apolloの機能(useQuery/useMutation)が使えるようにすること
 */
console.log("[main] file loaded");
import { createApp } from "vue";
import App from "./App.vue";

// VueとApolloをつなぐ公式パッケージ
import { DefaultApolloClient } from "@vue/apollo-composable";
import { apolloClient } from "./lib/apollo";

console.log("[main] before createApp");
const app = createApp(App);

// "default" クライアントとして全コンポーネントに提供
app.provide(DefaultApolloClient, apolloClient);
console.log("[main] provided DefaultApolloClient");

console.log("[main] before mount");
app.mount("#app"); // index.html の <div id="app"> に描画
console.log("[main] after mount");