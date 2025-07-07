import { createRouter, createWebHistory } from 'vue-router'
import XhsParser from '../components/XhsParser.vue'
import DyParser from '../components/DyParser.vue'
import PipixiaParser from '../components/PipixiaParser.vue'

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
    },
    {
        path: '/pipixia',
        name: 'PipixiaParser',
        component: PipixiaParser
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
