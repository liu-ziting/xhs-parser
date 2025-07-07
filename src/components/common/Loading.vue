<template>
    <div class="loading">
        <div class="spinner"></div>
        <p>{{ text }}</p>
    </div>
</template>
<script setup lang="ts">
const props = defineProps<{ text?: string }>()
</script>
<style scoped>
.loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: var(--primary-color);
}
.spinner {
    width: 32px;
    height: 32px;
    border: 4px solid #eee;
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 8px;
}
@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
