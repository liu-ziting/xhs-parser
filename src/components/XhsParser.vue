<template>
    <div class="container">
        <header>
            <div class="logo">
                <i class="fab fa-reddit-alien"></i>
            </div>
            <div class="header-text">
                <h1>小红书无水印解析工具</h1>
                <p>一键提取小红书笔记中的高清图片/视频</p>
            </div>
        </header>
        <div class="input-section">
            <div class="input-box">
                <div class="textarea-wrapper">
                    <Tabs :activeColor="'var(--primary-color)'" />
                    <textarea v-model="url" placeholder="在此处粘贴小红书分享链接" @keyup.enter="parseUrl" rows="1" ref="textarea" @input="autoResize"></textarea>
                    <button class="parse-btn" @click="parseUrl"><i class="fas fa-bolt"></i> 解析</button>
                </div>
            </div>
            <div class="note"><i class="fas fa-lightbulb"></i> 操作说明：复制小红书笔记分享链接，粘贴到上方输入框，点击解析按钮获取高清图片或视频，长按保存或右击另存为！</div>
        </div>
        <Loading v-if="loading" text="正在解析链接，请稍候..." />
        <div v-if="error" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ errorMessage }}</p>
        </div>
        <div v-if="result" class="result-section" ref="resultSectionRef">
            <div class="result-header">
                <h2>解析结果</h2>
                <!-- <button v-if="isVideo" class="download-all" @click="downloadVideo"><i class="fas fa-download"></i> 下载视频</button> -->
                <!-- <button v-else class="download-all" @click="downloadAll"><i class="fas fa-download"></i> 一键下载全部图片</button> -->
            </div>
            <div class="result-content">
                <VideoSection v-if="isVideo && result.url && result.cover" :url="result.url" :cover="result.cover" @download="downloadVideo" />
                <ImageSection
                    v-else-if="result.imgurl && result.cover"
                    :imgurl="result.imgurl"
                    :currentImage="currentImage"
                    @update:currentImage="val => (currentImage = val)"
                    @downloadMain="() => downloadImage(currentImage, result.title + '-主图.jpg')"
                />
                <PostInfo
                    v-if="result"
                    :author="result.author"
                    :userId="result.userId"
                    :authorID="result.authorID"
                    :title="result.title"
                    :desc="result.desc"
                    :avatar="result.avatar"
                    titleLabel="笔记标题"
                    descLabel="笔记描述"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { Tabs, Loading } from '@/components/common'
import ImageSection from '@/components/common/ImageSection.vue'
import VideoSection from '@/components/common/VideoSection.vue'
import PostInfo from '@/components/common/PostInfo.vue'
import { fetchXhsData } from '@/utils/api'
import { downloadFile } from '@/utils/download'
import type { XhsData } from '@/types/xhs'
import '@/styles/variables.css'
import '@/styles/common.css'

const url = ref('')
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const result = ref<XhsData | null>(null)
const currentImage = ref('')
const textarea = ref<HTMLTextAreaElement | null>(null)
const resultSectionRef = ref<HTMLElement | null>(null)

const isVideo = computed(() => result.value && result.value.url && !result.value.imgurl)

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
        errorMessage.value = '请输入小红书笔记链接'
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
        const response = await fetchXhsData(extractedUrl)
        if (response.data.code === 200) {
            result.value = response.data.data
            if (response.data.data.imgurl) {
                currentImage.value = response.data.data.cover
            }
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

const downloadImage = async (imgUrl: string, filename: string) => {
    const a = document.createElement('a')
    a.href = imgUrl
    a.download = filename
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

const downloadVideo = async () => {
    if (!result.value || !result.value.url) return
    await downloadFile(result.value.url, `${result.value.title}.mp4`)
}

const downloadAll = async () => {
    if (!result.value || !result.value.imgurl) return
    for (let i = 0; i < result.value.imgurl.length; i++) {
        const img = result.value.imgurl[i]
        await new Promise(resolve => {
            setTimeout(
                async () => {
                    await downloadImage(img, `${result.value!.title}-${i + 1}.jpg`)
                    resolve(null)
                },
                i === 0 ? 0 : 1000
            )
        })
    }
}
</script>

<style scoped></style>
