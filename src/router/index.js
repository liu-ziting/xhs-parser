import { createRouter, createWebHistory } from 'vue-router'
import XhsParser from '../components/XhsParser.vue'
import DyParser from '../components/DyParser.vue'

const routes = [
    {
        path: '/',
        name: 'XhsParser',
        component: XhsParser
    },
    {
        path: '/douyin',
        name: 'DyParser',
        component: DyParser
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
