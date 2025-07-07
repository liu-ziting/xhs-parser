<template>
    <div class="container">
        <header>
            <div class="logo">
                <i class="fab fa-reddit-alien"></i>
            </div>
            <div class="header-text">
                <h1>小红书图片解析工具</h1>
                <p>一键提取小红书笔记中的高清图片</p>
            </div>
        </header>

        <div class="input-section">
            <div class="input-box">
                <input type="text" v-model="url" placeholder="粘贴小红书笔记链接" @keyup.enter="parseUrl" />
                <button @click="parseUrl"><i class="fas fa-bolt"></i> 立即解析</button>
            </div>

            <div class="note"><i class="fas fa-lightbulb"></i> 操作说明：复制小红书笔记分享链接，粘贴到上方输入框，点击解析按钮获取高清图片</div>
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
                <button class="download-all" @click="downloadAll"><i class="fas fa-download"></i> 一键下载全部图片</button>
            </div>

            <div class="result-content">
                <!-- 图片展示区域（突出显示） -->
                <div class="images-section">
                    <div class="main-image">
                        <img :src="currentImage" referrerpolicy="no-referrer" alt="笔记主图" />
                        <button class="download-btn" @click="downloadImage(currentImage, result.title + '-主图.jpg')"><i class="fas fa-download"></i> 下载大图</button>
                    </div>

                    <div class="thumbnail-grid">
                        <div v-for="(img, index) in result.imgurl" :key="index" class="thumbnail" :class="{ active: currentImage === img }" @click="currentImage = img">
                            <img :src="img" :alt="'缩略图' + (index + 1)" referrerpolicy="no-referrer" />
                        </div>
                    </div>
                </div>

                <!-- 用户信息区域（弱化显示） -->
                <div class="post-info">
                    <div class="author-info">
                        <div class="author-avatar">
                            <img :src="result.avatar" alt="作者头像" />
                        </div>
                        <div class="author-details">
                            <h3>{{ result.author }}</h3>
                            <p>ID: {{ result.userId }}</p>
                        </div>
                    </div>

                    <div class="post-details">
                        <h4>笔记标题</h4>
                        <p class="post-title">{{ result.title }}</p>

                        <h4>笔记描述</h4>
                        <p class="post-desc">{{ result.desc }}</p>
                    </div>
                </div>
            </div>
        </div>

        <footer>
            <p>© 2025 小红书图片解析工具 | 本工具仅用于学习交流，请勿用于商业用途</p>
            <p>提示：下载图片请遵守小红书平台规定和版权要求</p>
        </footer>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import axios, { AxiosError } from 'axios'

// 定义API返回数据类型
interface XhsData {
    author: string
    userId: string
    title: string
    desc: string
    avatar: string
    cover: string
    imgurl: string[]
}

interface ApiResponse {
    code: number
    msg: string
    data: XhsData
}

export default defineComponent({
    name: 'XhsParser',
    setup() {
        // 创建自定义axios实例，忽略500错误
        const api = axios.create({
            baseURL: import.meta.env.VITE_API_URL,
            validateStatus: function (status) {
                // 接受200-299和500状态码
                return (status >= 200 && status < 300) || status === 500
            }
        })

        // 响应式变量
        const url = ref('')
        const loading = ref(false)
        const error = ref(false)
        const errorMessage = ref('')
        const result = ref<XhsData | null>(null)
        const currentImage = ref('')

        // 解析URL
        // 在parseUrl方法中添加URL提取逻辑
        const parseUrl = async () => {
            const inputText = url.value.trim()

            if (!inputText) {
                error.value = true
                errorMessage.value = '请输入小红书笔记链接'
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
                    currentImage.value = response.data.data.cover
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

        // 下载单张图片
        const downloadImage = async (imgUrl: string, filename: string) => {
            try {
                // 使用fetch获取图片数据
                const response = await fetch(imgUrl)
                const blob = await response.blob()
                const blobUrl = window.URL.createObjectURL(blob)

                const link = document.createElement('a')
                link.href = blobUrl
                link.download = filename || 'xhs-image.jpg'

                document.body.appendChild(link)
                link.click()

                // 清理
                setTimeout(() => {
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(blobUrl)
                }, 100)
            } catch (error) {
                console.error('下载失败:', error)
                error.value = true
                errorMessage.value = '图片下载失败，请重试或检查网络'

                // 回退到直接链接方法
                const fallbackLink = document.createElement('a')
                fallbackLink.href = imgUrl
                fallbackLink.download = filename || 'xhs-image.jpg'
                fallbackLink.target = '_blank'
                document.body.appendChild(fallbackLink)
                fallbackLink.click()
                document.body.removeChild(fallbackLink)
            }
        }

        // 下载全部图片
        const downloadAll = async () => {
            if (!result.value) return

            for (let i = 0; i < result.value.imgurl.length; i++) {
                const img = result.value.imgurl[i]
                await new Promise(resolve => {
                    setTimeout(
                        async () => {
                            await downloadImage(img, `${result.value!.title}-${i + 1}.jpg`)
                            resolve(null)
                        },
                        i === 0 ? 0 : 1000
                    ) // 第一个立即下载，后面的间隔1秒
                })
            }
        }

        return {
            url,
            loading,
            error,
            errorMessage,
            result,
            currentImage,
            parseUrl,
            downloadImage,
            downloadAll
        }
    }
})
</script>
