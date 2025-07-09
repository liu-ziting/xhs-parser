<template>
    <!-- 仅红色文字，弱化为链接样式 -->
    <span class="example-btn" @click="emitExample">示例</span>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
const props = defineProps<{ example: string }>()
const emit = defineEmits(['set-example'])
const emitExample = () => emit('set-example', props.example)
</script>
<style scoped>
.example-btn {
    margin-left: 0px;
    color: #ff2442;
    cursor: pointer;
    font-size: 0.98rem;
    font-weight: 500;
    text-decoration: underline dotted;
    background: none;
    border: none;
    padding: 0;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    transition: color 0.2s;
}
.example-btn:hover {
    color: #e01e3c;
    text-decoration: underline;
}
</style>
