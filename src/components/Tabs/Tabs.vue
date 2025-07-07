<template>
    <nav class="tab-container">
        <router-link v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab-item" active-class="active">
            <i :class="tab.icon"></i>
            <span class="tab-text">{{ tab.label }}</span>
        </router-link>
        <div ref="indicator" class="tab-indicator"></div>
    </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

interface TabItem {
    to: string
    label: string
    icon: string
}

const props = defineProps<{ customTabs?: TabItem[] }>()

const router = useRouter()
const indicator = ref<HTMLDivElement | null>(null)

const defaultTabs: TabItem[] = [
    { to: '/', label: '小红书解析', icon: 'fab fa-reddit-alien' },
    { to: '/douyin', label: '抖音解析', icon: 'fab fa-tiktok' }
]

const tabs = computed(() => props.customTabs ?? defaultTabs)

const updateIndicatorPosition = () => {
    const activeElement = document.querySelector('.tab-item.active') as HTMLElement | null
    if (activeElement && indicator.value) {
        indicator.value.style.left = `${activeElement.offsetLeft}px`
        indicator.value.style.width = `${activeElement.offsetWidth}px`
    }
}

onMounted(() => {
    updateIndicatorPosition()
    window.addEventListener('resize', updateIndicatorPosition)
})

onUnmounted(() => {
    window.removeEventListener('resize', updateIndicatorPosition)
})
</script>

<style scoped>
.tab-container {
    position: relative;
    display: flex;
    background: #f8f9fa;
    border-radius: 12px;
    padding: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

.tab-item {
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    color: #6c757d;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.3s ease;
    border-radius: 8px;
    cursor: pointer;
    flex: 1;
}

.tab-item i {
    margin-right: 8px;
    font-size: 18px;
}

.tab-text {
    font-size: 15px;
}

.tab-item.active {
    color: #fff;
}

.tab-indicator {
    position: absolute;
    z-index: 1;
    top: 6px;
    height: calc(100% - 12px);
    border-radius: 8px;
    /* background: linear-gradient(135deg, #ff4d4d, #f9cb28); */
    background: #000000d1;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.tab-item:not(.active):hover {
    color: #495057;
    background: rgba(255, 255, 255, 0.7);
}
</style>
