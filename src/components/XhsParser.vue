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
                    v-else-if="(result.images || result.imgurl) && result.cover"
                    :imgurl="result.images || result.imgurl || []"
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
            <div class="ai-suggestion-section">
                <div class="suggestion-header">
                    <h2><i class="fas fa-robot"></i> AI投流建议</h2>
                    <button class="get-suggestion-btn" @click="getAiSuggestion" :disabled="aiLoading">
                        <i class="fas" :class="aiLoading ? 'fa-spinner fa-spin' : 'fa-magic'"></i>
                        {{ aiLoading ? '分析中...' : '一键获取' }}
                    </button>
                </div>
                <div v-if="aiLoading" class="ai-loading">
                    <Loading text="正在分析数据，请稍候..." />
                </div>
                <div v-if="aiError" class="ai-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>{{ aiErrorMessage }}</p>
                </div>
                <!-- 默认展示分析维度 -->
                <div v-if="!aiSuggestion && !aiLoading" class="analysis-preview">
                    <div class="preview-header">
                        <h3><i class="fas fa-chart-line"></i> AI分析维度</h3>
                        <p>基于5年+投流操盘手经验，从以下4个维度深度分析您的笔记</p>
                    </div>
                    <div class="analysis-dimensions">
                        <div class="dimension-item">
                            <div class="dimension-icon">
                                <i class="fas fa-bullseye"></i>
                            </div>
                            <div class="dimension-content">
                                <h4>内容定位分析</h4>
                                <p>话题关联性量化、核心方向提炼、话题覆盖率计算</p>
                            </div>
                        </div>
                        <div class="dimension-item">
                            <div class="dimension-icon">
                                <i class="fas fa-users"></i>
                            </div>
                            <div class="dimension-content">
                                <h4>受众画像建议</h4>
                                <p>地域定位推荐、兴趣标签匹配、人群特征分析</p>
                            </div>
                        </div>
                        <div class="dimension-item">
                            <div class="dimension-icon">
                                <i class="fas fa-rocket"></i>
                            </div>
                            <div class="dimension-content">
                                <h4>精准投流策略</h4>
                                <p>话题扩展建议、人群定向优化、竞品借势分析</p>
                            </div>
                        </div>
                        <div class="dimension-item">
                            <div class="dimension-icon">
                                <i class="fas fa-magic"></i>
                            </div>
                            <div class="dimension-content">
                                <h4>内容优化建议</h4>
                                <p>标题升级方案、标签重构策略、CTR提升预估</p>
                            </div>
                        </div>
                    </div>
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
            if (response.data.data.images || response.data.data.imgurl) {
                currentImage.value = response.data.data.cover
            }
            // 解析成功后滚动到结果
            nextTick(() => {
                resultSectionRef.value?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
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
    const images = result.value?.images || result.value?.imgurl
    if (!result.value || !images) return
    for (let i = 0; i < images.length; i++) {
        const img = images[i]
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
                        content: `# 小红书投流策略优化提示词  
> 角色设定：5年+投流操盘手，擅长用数据拆解内容与流量漏斗，帮助品牌低成本高转化。 

---

## 1. 内容定位分析
- **话题关联性**  
  量化正文与标签的匹配度（≥80% 为佳），指出冗余或缺口标签。  
- **核心方向**  
  8 字以内提炼：主卖点 + 情绪价值。  
- **话题覆盖**  
  计算当前标签在「站内搜索指数」+「类目 TOP500」的覆盖率，标出空白区。

---

## 2. 受众画像建议
- **地域定位**  
  推荐 3 个一线/新一线 + 2 个下沉潜力城市，附 TGI 指数。  
- **兴趣标签**  
  5 个高相关圈层。  
- **人群特征**  
  用 3 组人群包描述：  
  1) 年龄层 / 消费能力 / 行为特征  
  2) …  
  3) …

---

## 3. 精准投流策略
- **话题扩展**  
  新增 3-5 个「搜索量 5w-20w」「竞争度 <30」的长尾话题。  
- **人群定向**  
  DMP 人群包：地域 + 兴趣 + 行为。  
- **竞品借势**  
  3 位近 30 日涨粉 ≥5k 的同类作者，可复制钩子。  
- **投放时机**  
  未来 30 天内的 3 个搜索峰值节点，精确到小时级投放时段。

---

## 4. 优化建议
- **标题升级**  
  A/B 两版：钩子 + 关键词 + 悬念，预估 CTR 提升幅度。  
- **标签重构**  
  新组合：1 主标签 + 3 长尾 + 1 场景标签，并用一句话说明替换理由。

---`
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
    padding: 30px;
    background: linear-gradient(135deg, #ff2442 0%, #ff6b7a 100%);
    border-radius: 16px;
    box-shadow: 0 12px 40px rgba(255, 36, 66, 0.25);
    margin: 30px 0;
    position: relative;
    overflow: hidden;
}

.ai-suggestion-section::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    pointer-events: none;
}

.suggestion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
    z-index: 1;
    margin-bottom: 20px;
}

.suggestion-header h2 {
    color: white;
    font-size: 1.4rem;
    font-weight: 600;
    margin: 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
}

.suggestion-header h2 i {
    margin-right: 12px;
    color: #ffffff;
    font-size: 1.5rem;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
    100% {
        transform: scale(1);
    }
}

.get-suggestion-btn {
    background: rgba(255, 255, 255, 0.25);
    border: 2px solid rgba(255, 255, 255, 0.4);
    color: white;
    padding: 15px 30px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    transition: all 0.3s ease;
    backdrop-filter: blur(15px);
    position: relative;
    z-index: 1;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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
    background: rgba(255, 255, 255, 0.98);
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    margin-top: 20px;
    position: relative;
    z-index: 1;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
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
    color: #ff2442;
    margin: 20px 0 10px 0;
    font-weight: 600;
}

.suggestion-text :deep(p) {
    margin-bottom: 15px;
}

.suggestion-text :deep(strong) {
    color: #ff2442;
    font-weight: 600;
}

.suggestion-text :deep(em) {
    color: #ff6b7a;
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
    border-left: 4px solid #ff2442;
    padding-left: 15px;
    margin: 15px 0;
    font-style: italic;
    color: #666;
}

.analysis-preview {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 12px;
    padding: 25px;
    position: relative;
    z-index: 1;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.preview-header {
    text-align: center;
    margin-bottom: 25px;
}

.preview-header h3 {
    color: #ff2442;
    font-size: 1.3rem;
    font-weight: 600;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-header h3 i {
    margin-right: 10px;
    color: #ff2442;
}

.preview-header p {
    color: #666;
    font-size: 0.95rem;
    margin: 0;
    line-height: 1.5;
}

.analysis-dimensions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
}

.dimension-item {
    display: flex;
    align-items: flex-start;
    padding: 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 10px;
    border: 1px solid rgba(255, 36, 66, 0.1);
    transition: all 0.3s ease;
}

.dimension-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(255, 36, 66, 0.15);
    border-color: rgba(255, 36, 66, 0.2);
}

.dimension-icon {
    flex-shrink: 0;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #ff2442, #ff6b7a);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
}

.dimension-icon i {
    color: white;
    font-size: 1.2rem;
}

.dimension-content h4 {
    color: #333;
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 8px 0;
}

.dimension-content p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
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

    .analysis-dimensions {
        grid-template-columns: 1fr;
        gap: 15px;
    }

    .dimension-item {
        padding: 15px;
    }

    .dimension-icon {
        width: 40px;
        height: 40px;
        margin-right: 12px;
    }

    .dimension-icon i {
        font-size: 1rem;
    }
}
</style>
