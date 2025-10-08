// 役割: Vueアプリの起点。Apollo Client を全コンポーネントに提供する。
import { createApp } from 'vue'
import App from './App.vue' // ルートコンポーネント（後述の pages をここで出し分け）
import { DefaultApolloClient } from '@vue/apollo-composable'
import { apolloClient } from './libs/apolloClient' // Apollo Client の実体
import router from './router' // 画面遷移の仕組み（一覧→詳細→戻る）


createApp(App)
// provide: 全コンポーネントから Apollo Client を使えるように注入
.provide(DefaultApolloClient, apolloClient)
.use(router)
.mount('#app')