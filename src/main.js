import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Tabs from '@/components/Tabs'

const app = createApp(App)

app.use(router)
app.use(Tabs)

app.mount('#app')
