<template>
    <div class="video-section">
        <div class="main-video">
            <video controls :poster="cover">
                <source :src="url" type="video/mp4" />
                您的浏览器不支持 HTML5 视频标签。
            </video>
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ url: string; cover: string }>()
const emit = defineEmits(['download'])
</script>

<script lang="ts">
export default {}
</script>

<style scoped>
.video-section {
    /* ...可补充样式... */
}
</style>
