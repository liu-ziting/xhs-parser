<template>
    <div class="container">
        <header>
            <div class="logo">
                <i class="fab fa-tiktok"></i>
            </div>
            <div class="header-text">
                <h1>抖音无水印视频解析工具</h1>
                <p>一键提取抖音无水印高清视频</p>
            </div>
        </header>
        <div class="input-section">
            <Tabs :activeColor="'var(--bg-gradient)'" />
            <div class="input-box">
                <div class="textarea-wrapper">
                    <textarea v-model="url" placeholder="在此处粘贴抖音分享链接" @keyup.enter="parseUrl" rows="1" ref="textarea" @input="autoResize"></textarea>
                    <button class="parse-btn" @click="parseUrl"><i class="fas fa-bolt"></i> 解析</button>
                </div>
            </div>
            <div class="note">
                <i class="fas fa-lightbulb"></i>
                操作说明：复制抖音视频分享链接，粘贴到上方输入框，点击解析按钮获取高清无水印视频，长按保存或右击另存为！
                <ExampleButton :example="dyExample" @set-example="setExample" />
            </div>
        </div>
        <Loading v-if="loading" text="正在解析链接，请稍候..." />
        <div v-if="error" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ errorMessage }}</p>
        </div>
        <div v-if="result" class="result-section" ref="resultSectionRef">
            <div class="result-header">
                <h2>解析结果</h2>
                <!-- <button class="download-all" @click="downloadVideo"><i class="fas fa-download"></i> 下载视频</button> -->
            </div>
            <div class="result-content">
                <VideoSection v-if="result.url && result.cover" :url="result.url" :cover="result.cover" :showDownload="false" @download="downloadVideo" />
                <PostInfo
                    v-if="result"
                    :author="result.author"
                    :userId="result.userId"
                    :authorID="result.authorID"
                    :title="result.title"
                    :desc="result.desc"
                    :avatar="result.avatar"
                    titleLabel="视频标题"
                    descLabel="视频描述"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Tabs, Loading, ExampleButton } from '@/components/common'
import VideoSection from '@/components/common/VideoSection.vue'
import PostInfo from '@/components/common/PostInfo.vue'
import { fetchDouyinData } from '@/utils/douyinApi'
import { downloadFile } from '@/utils/download'
import type { DouyinData } from '@/types/douyin'
import '@/styles/variables.css'
import '@/styles/common.css'

const url = ref('')
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const result = ref<DouyinData | null>(null)
const textarea = ref<HTMLTextAreaElement | null>(null)
const resultSectionRef = ref<HTMLElement | null>(null)

const dyExample =
    '6.94 # 毛孩子的日常 # 萌宠出道计划 # 记录猫咪日常 # 猫咪是生活的解药 # 喵星人的日常  https://v.douyin.com/Iws-P9vsI8w/ 复制此链接，打开抖音搜索，直接观看视频！ ban:/ 12/22 E@H.Vl '
const setExample = (val: string) => {
    url.value = val
    nextTick(autoResize)
}

const autoResize = () => {
    if (textarea.value) {
        textarea.value.style.height = 'auto'
        textarea.value.style.height = `${textarea.value.scrollHeight}px`
    }
}

const parseUrl = async () => {
    const inputText = url.value.trim()
    if (!inputText) {
        error.value = true
        errorMessage.value = '请输入抖音视频链接'
        return
    }
    let extractedUrl = ''
    try {
        const urlRegex = /(https?:\/\/[^\s]+)/g
        const matches = inputText.match(urlRegex)
        if (matches && matches.length > 0) {
            extractedUrl = matches[0].replace(/[。，、；！？]/g, '')
            new URL(extractedUrl)
        } else {
            error.value = true
            errorMessage.value = '未找到有效链接，请检查后重试'
            return
        }
    } catch (e) {
        error.value = true
        errorMessage.value = '链接格式不正确，请检查后重试'
        return
    }
    loading.value = true
    error.value = false
    result.value = null
    try {
        const response = await fetchDouyinData(extractedUrl)
        if (response.data.code === 200) {
            result.value = response.data.data
            // 解析成功后滚动到结果
            nextTick(() => {
                resultSectionRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
        } else {
            error.value = true
            errorMessage.value = response.data.msg || '解析失败'
        }
    } catch (err: any) {
        error.value = true
        if (err.response) {
            errorMessage.value = `服务器错误: ${err.response.status}`
        } else if (err.request) {
            errorMessage.value = '网络错误，请检查您的连接'
        } else {
            errorMessage.value = '请求配置错误'
        }
        console.error(err)
    } finally {
        loading.value = false
    }
}

const downloadVideo = async () => {
    if (!result.value || !result.value.url) return
    await downloadFile(result.value.url, `${result.value.title}.mp4`)
}
</script>

<style scoped>
header {
    background: var(--bg-gradient);
}
</style>
