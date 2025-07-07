<template>
    <XhsParser />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import XhsParser from './components/XhsParser.vue'

export default defineComponent({
    name: 'App',
    components: {
        XhsParser
    }
})
</script>

<style>
/* 引入全局样式 */
@import './styles/main.css';
</style>

