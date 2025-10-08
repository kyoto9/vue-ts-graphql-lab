// 役割: 画面遷移を管理。URLに応じて表示コンポーネントを切り替える。
import { createRouter, createWebHistory } from 'vue-router'
import TodoList from './pages/TodoList.vue'
import TodoDetail from './pages/TodoDetail.vue'


const routes = [
    { path: '/', name: 'list', component: TodoList },
    // :id は URL パラメータ。例: /todo/123 → id=123
    { path: '/todo/:id', name: 'detail', component: TodoDetail, props: true },
]


export default createRouter({
    history: createWebHistory(),
    routes,
})