import { createRouter, createWebHistory } from 'vue-router'
import XhsParser from '../components/XhsParser.vue'
import DyParser from '../components/DyParser.vue'
import PipixiaParser from '../components/PipixiaParser.vue'
import NeteaseParser from '../components/NeteaseParser.vue'

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
    },
    {
        path: '/netease',
        name: 'NeteaseParser',
        component: NeteaseParser
    }
]

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes
})

export default router
