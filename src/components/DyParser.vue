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
            <Tabs />
            <div class="input-box">
                <div class="textarea-wrapper">
                    <textarea v-model="url" placeholder="在此处粘贴抖音分享链接" @keyup.enter="parseUrl" rows="1" ref="textarea" @input="autoResize"></textarea>
                    <button class="parse-btn" @click="parseUrl"><i class="fas fa-bolt"></i> 解析</button>
                </div>
            </div>

            <div class="note"><i class="fas fa-lightbulb"></i> 操作说明：复制抖音视频分享链接，粘贴到上方输入框，点击解析按钮获取高清无水印视频</div>
        </div>

        <div v-if="loading" class="loading">
            <div class="spinner"></div>
            <p>正在解析链接，请稍候...</p>
        </div>

        <div v-if="error" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ errorMessage }}</p>
        </div>

        <div v-if="result" class="result-section">
            <div class="result-header">
                <h2>解析结果</h2>
                <button class="download-all" @click="downloadVideo"><i class="fas fa-download"></i> 下载视频</button>
            </div>

            <div class="result-content">
                <!-- 视频展示区域 -->
                <div class="video-section">
                    <div class="main-video">
                        <video controls :poster="result.cover">
                            <source :src="result.url" type="video/mp4" />
                            您的浏览器不支持 HTML5 视频标签。
                        </video>
                    </div>
                </div>

                <!-- 用户信息区域 -->
                <div class="post-info">
                    <div class="author-info">
                        <div class="author-avatar">
                            <img :src="result.avatar" alt="作者头像" />
                        </div>
                        <div class="author-details">
                            <h3>{{ result.author }}</h3>
                            <p>ID: {{ result.userId || result.authorID }}</p>
                        </div>
                    </div>

                    <div class="post-details">
                        <h4>视频标题</h4>
                        <p class="post-title">{{ result.title }}</p>

                        <h4>视频描述</h4>
                        <p class="post-desc">{{ result.desc }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import axios, { AxiosError } from 'axios'

// 定义API返回数据类型
interface DouyinData {
    author: string
    userId?: string
    authorID?: string
    title: string
    desc: string
    avatar: string
    cover: string
    url: string
}

interface ApiResponse {
    code: number
    msg: string
    data: DouyinData
}

export default defineComponent({
    name: 'DouyinParser',
    setup() {
        // 创建自定义axios实例
        const api = axios.create({
            baseURL: 'https://api.bugpk.com/api/douyin',
            validateStatus: function (status) {
                return (status >= 200 && status < 300) || status === 500
            }
        })

        // 响应式变量
        const url = ref('')
        const loading = ref(false)
        const error = ref(false)
        const errorMessage = ref('')
        const result = ref<DouyinData | null>(null)

        // 解析URL
        const parseUrl = async () => {
            const inputText = url.value.trim()

            if (!inputText) {
                error.value = true
                errorMessage.value = '请输入抖音视频链接'
                return
            }

            // 尝试从文本中提取URL
            let extractedUrl = ''
            try {
                // 使用正则表达式匹配URL
                const urlRegex = /(https?:\/\/[^\s]+)/g
                const matches = inputText.match(urlRegex)

                if (matches && matches.length > 0) {
                    // 取第一个匹配的URL
                    extractedUrl = matches[0]

                    // 处理可能的多余字符（如中文标点符号）
                    extractedUrl = extractedUrl.replace(/[。，、；！？]/g, '')

                    // 验证URL格式
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
                // 使用提取的URL调用API
                const response = await api.get<ApiResponse>('', {
                    params: {
                        url: extractedUrl
                    }
                })

                if (response.data.code === 200) {
                    result.value = response.data.data
                } else {
                    error.value = true
                    errorMessage.value = response.data.msg || '解析失败'
                }
            } catch (err) {
                error.value = true
                const axiosError = err as AxiosError
                if (axiosError.response) {
                    errorMessage.value = `服务器错误: ${axiosError.response.status}`
                } else if (axiosError.request) {
                    errorMessage.value = '网络错误，请检查您的连接'
                } else {
                    errorMessage.value = '请求配置错误'
                }
                console.error(err)
            } finally {
                loading.value = false
            }
        }

        // 下载视频
        const downloadVideo = async () => {
            if (!result.value || !result.value.url) return

            try {
                const videoUrl = result.value.url
                const response = await fetch(videoUrl)
                const blob = await response.blob()
                const blobUrl = window.URL.createObjectURL(blob)

                const link = document.createElement('a')
                link.href = blobUrl
                link.download = `${result.value.title}.mp4` || 'douyin-video.mp4'

                document.body.appendChild(link)
                link.click()

                // 清理
                setTimeout(() => {
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(blobUrl)
                }, 100)
            } catch (error) {
                console.error('视频下载失败:', error)
                error.value = true
                errorMessage.value = '视频下载失败，请重试或检查网络'

                // 回退到直接链接方法
                const fallbackLink = document.createElement('a')
                fallbackLink.href = result.value.url
                fallbackLink.download = `${result.value.title}.mp4` || 'douyin-video.mp4'
                fallbackLink.target = '_blank'
                document.body.appendChild(fallbackLink)
                fallbackLink.click()
                document.body.removeChild(fallbackLink)
            }
        }

        const textarea = ref<HTMLTextAreaElement | null>(null)

        const autoResize = () => {
            if (textarea.value) {
                textarea.value.style.height = 'auto'
                textarea.value.style.height = `${textarea.value.scrollHeight}px`
            }
        }

        return {
            url,
            loading,
            error,
            errorMessage,
            result,
            parseUrl,
            downloadVideo,
            textarea,
            autoResize
        }
    }
})
</script>
<style scoped>
header {
    background: var(--bg-gradient);
}
</style>
