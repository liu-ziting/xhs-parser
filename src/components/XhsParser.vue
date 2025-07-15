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
            <div class="note">
                <i class="fas fa-lightbulb"></i>
                操作说明：复制小红书笔记分享链接，粘贴到上方输入框，点击解析按钮获取高清图片或视频！
                <ExampleButton :example="xhsExample" @set-example="setExample" />
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
            <!-- AI投流建议模块 -->
            <div v-if="result" class="ai-suggestion-section">
                <div class="suggestion-header">
                    <h2><i class="fas fa-robot"></i> AI投流建议</h2>
                    <button class="get-suggestion-btn" @click="getAiSuggestion" :disabled="aiLoading">
                        <i class="fas" :class="aiLoading ? 'fa-spinner fa-spin' : 'fa-magic'"></i>
                        {{ aiLoading ? '分析中...' : '获取投流建议' }}
                    </button>
                </div>
                <div v-if="aiLoading" class="ai-loading">
                    <Loading text="正在分析数据，请稍候..." />
                </div>
                <div v-if="aiError" class="ai-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>{{ aiErrorMessage }}</p>
                </div>
                <div v-if="aiSuggestion" class="suggestion-content">
                    <div class="suggestion-text" v-html="formattedSuggestion"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { marked } from 'marked'
import { Tabs, Loading, ExampleButton } from '@/components/common'
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
const aiLoading = ref(false)
const aiError = ref(false)
const aiErrorMessage = ref('')
const aiSuggestion = ref('')

const xhsExample = '15 因吹斯汀发布了一篇小红书笔记，快来看吧！ 😆 SN7fWpcevhCN7Q4 😆 http://xhslink.com/a/8AMzWCjxuowgb 复制本条信息，打开【小红书】App查看精彩内容！'
const setExample = (val: string) => {
    url.value = val
    nextTick(autoResize)
}

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

const getAiSuggestion = async () => {
    if (!result.value) return

    aiLoading.value = true
    aiError.value = false
    aiErrorMessage.value = ''
    aiSuggestion.value = ''

    try {
        // 构建发送给AI的数据
        const aiData = {
            title: result.value.title,
            description: result.value.desc,
            author: result.value.author
            // images: result.value.imgurl || [],
            // video: result.value.url || '',
            // cover: result.value.cover,
            // avatar: result.value.avatar
        }

        // 直接写死的API密钥
        const apiKey = 'a835b9f6866d48ec956d341418df8a50.NuhlKYn58EkCb5iP'

        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'GLM-4.1V-Thinking-Flash',
                messages: [
                    {
                        role: 'system',
                        content: `你是一个小红书投流策略专家，请基于以下笔记内容进行深度分析，并给出精准的投放建议：
**分析要求**
1. 内容定位分析：
   - 解析标题"良渚"与话题标签的关联性
   - 识别核心内容方向（历史/旅游/生活方式）
   - 评估当前话题组合的覆盖面和精准度

2. 受众画像建议：
   - 地域定位：根据"良渚古城""苕溪"等关键词推荐重点投放城市
   - 兴趣标签：结合#后花园#暖村等标签推测潜在用户兴趣圈层
   - 人群特征：推断可能吸引的年龄层及用户类型（如文化爱好者/亲子游群体）

3. 精准投流策略：
   ▶ 话题扩展：建议新增3-5个相关话题（例：#杭州周边游 #周末去哪玩）
   ▶ 人群定向：明确应触达的粉丝画像（地域/兴趣/行为特征）
   ▶ 竞品关联：推荐可借势的同类热门笔记作者
   ▶ 投放时机：结合"暖村"标签推荐季节性投放节点

4. 优化建议：
   - 标题增强吸引力的修改方案
   - 话题标签结构调整建议`
                    },
                    {
                        role: 'user',
                        content: `请分析以下小红书笔记并提供投流建议：\n${JSON.stringify(aiData, null, 2)}`
                    }
                ],
                temperature: 0.7
            })
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        if (data.choices && data.choices[0] && data.choices[0].message) {
            aiSuggestion.value = data.choices[0].message.content
        } else {
            throw new Error('Invalid response format')
        }
    } catch (err: any) {
        aiError.value = true
        aiErrorMessage.value = err.message || '获取AI建议失败，请稍后重试'
        console.error('AI建议获取失败:', err)
    } finally {
        aiLoading.value = false
    }
}

const formattedSuggestion = computed(() => {
    if (!aiSuggestion.value) return ''
    // 使用marked库格式化markdown内容
    return marked(aiSuggestion.value)
})
</script>

<style scoped>
.ai-suggestion-section {
    padding: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    margin: 20px 0;
}

.suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.suggestion-header h2 {
    color: white;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}

.suggestion-header h2 i {
    margin-right: 10px;
    color: #ffd700;
}

.get-suggestion-btn {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.get-suggestion-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.get-suggestion-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.ai-loading {
    text-align: center;
    padding: 40px;
    color: #ffffff;
}

.ai-error {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 15px;
    color: #ff6b6b;
    text-align: center;
}

.suggestion-content {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    margin-top: 20px;
}

.suggestion-text {
    line-height: 1.8;
    color: #333;
}

.suggestion-text :deep(h1),
.suggestion-text :deep(h2),
.suggestion-text :deep(h3),
.suggestion-text :deep(h4),
.suggestion-text :deep(h5),
.suggestion-text :deep(h6) {
    color: #667eea;
    margin: 20px 0 10px 0;
    font-weight: 600;
}

.suggestion-text :deep(p) {
    margin-bottom: 15px;
}

.suggestion-text :deep(strong) {
    color: #667eea;
    font-weight: 600;
}

.suggestion-text :deep(em) {
    color: #764ba2;
    font-style: italic;
}

.suggestion-text :deep(ul),
.suggestion-text :deep(ol) {
    margin: 15px 0;
    padding-left: 30px;
}

.suggestion-text :deep(li) {
    margin-bottom: 8px;
}

.suggestion-text :deep(code) {
    background: #f4f4f4;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
}

.suggestion-text :deep(pre) {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 15px 0;
}

.suggestion-text :deep(blockquote) {
    border-left: 4px solid #667eea;
    padding-left: 15px;
    margin: 15px 0;
    font-style: italic;
    color: #666;
}

@media (max-width: 768px) {
    .suggestion-header {
        flex-direction: column;
        align-items: stretch;
        gap: 15px;
    }

    .get-suggestion-btn {
        width: 100%;
    }
    .ai-suggestion-section {
        padding: 20px 10px;
    }
}
</style>
