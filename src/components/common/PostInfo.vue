<template>
    <div class="post-info">
        <div class="author-info">
            <div class="author-avatar">
                <img :src="avatar" alt="作者头像" />
            </div>
            <div class="author-details">
                <h3>{{ author }}</h3>
                <p>ID: {{ userId || authorID }}</p>
            </div>
        </div>
        <div class="post-details">
            <h4>{{ titleLabel }}</h4>
            <p class="post-title">{{ title }}</p>
            <h4>{{ descLabel }}</h4>
            <p class="post-desc">{{ desc }}</p>
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps } from 'vue'
const props = defineProps<{
    author: string
    userId?: string
    authorID?: string
    title: string
    desc: string
    avatar: string
    titleLabel?: string
    descLabel?: string
}>()
</script>
