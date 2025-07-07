<template>
    <div class="images-section">
        <div class="main-image">
            <img :src="currentImage" referrerpolicy="no-referrer" alt="笔记主图" />
            <button class="download-btn" @click="onDownloadMain"><i class="fas fa-download"></i> 下载大图</button>
        </div>
        <div class="thumbnail-grid">
            <div v-for="(img, index) in imgurl" :key="index" class="thumbnail" :class="{ active: currentImage === img }" @click="onSelect(img)">
                <img :src="img" :alt="'缩略图' + (index + 1)" referrerpolicy="no-referrer" />
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ imgurl: string[]; currentImage: string }>()
const emit = defineEmits(['update:currentImage', 'downloadMain'])
const onSelect = (img: string) => emit('update:currentImage', img)
const onDownloadMain = () => emit('downloadMain')
</script>

<script lang="ts">
export default {}
</script>

<style scoped>
.images-section {
    /* ...可补充样式... */
}
</style>
