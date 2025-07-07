<template>
    <div class="video-section">
        <div class="main-video">
            <video controls :poster="cover">
                <source :src="url" type="video/mp4" />
                您的浏览器不支持 HTML5 视频标签。
            </video>
        </div>
        <button v-if="showDownload" class="download-all" @click="onDownload"><i class="fas fa-download"></i> 下载视频</button>
    </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{
    url: string
    cover: string
    showDownload?: boolean
}>()
const emit = defineEmits(['download'])
const onDownload = () => emit('download')
</script>
