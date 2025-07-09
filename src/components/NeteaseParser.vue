<template>
    <div class="container">
        <header>
            <div class="logo">
                <i class="fas fa-music"></i>
            </div>
            <div class="header-text">
                <h1>网易云音乐解析工具</h1>
                <p>一键获取网易云音乐无损音源</p>
            </div>
        </header>
        <div class="input-section">
            <Tabs :activeColor="'linear-gradient(90deg, #c20c0c, #e72d2d)'" />
            <div class="input-box">
                <div class="textarea-wrapper">
                    <textarea v-model="url" placeholder="在此处粘贴网易云音乐分享链接" @keyup.enter="parseUrl" rows="1" ref="textarea" @input="autoResize"></textarea>
                    <button class="parse-btn" @click="parseUrl"><i class="fas fa-bolt"></i> 解析</button>
                </div>
            </div>
            <div class="note">
                <i class="fas fa-lightbulb"></i>
                操作说明：复制网易云音乐分享链接，粘贴到上方输入框，点击解析按钮获取音乐资源！
                <ExampleButton :example="neteaseExample" @set-example="setExample" />
            </div>
        </div>
        <Loading v-if="loading" text="正在解析链接，请稍候..." />
        <div v-if="error" class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ errorMessage }}</p>
        </div>
        <div v-if="result" class="result-section" ref="resultSectionRef">
            <div class="result-content">
                <div class="music-info">
                    <div class="music-cover">
                        <img :src="result.pic" :alt="result.name" />
                    </div>
                    <div class="music-details">
                        <h2>{{ result.name }}</h2>
                        <p class="artist">歌手：{{ result.ar_name }}</p>
                        <p class="album">专辑：{{ result.al_name }}</p>
                        <p class="quality">音质：{{ result.level }}</p>
                        <p class="size">大小：{{ result.size }}</p>
                        <button class="download-music" @click="downloadMusic"><i class="fas fa-download"></i> 下载音乐</button>

                        <audio v-if="result.url" class="music-player" :src="result.url" controls></audio>
                    </div>
                </div>
                <div v-if="result.lyric" class="lyrics">
                    <h3><i class="fas fa-microphone-alt"></i> 歌词</h3>
                    <div class="lyric-box">
                        <pre>{{ formatLyrics(result.lyric) }}</pre>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { Tabs, Loading, ExampleButton } from '@/components/common'
import { fetchNeteaseData } from '@/utils/neteaseApi'
import { downloadFile } from '@/utils/download'
import type { NeteaseData } from '@/types/netease'

const url = ref('')
const loading = ref(false)
const error = ref(false)
const errorMessage = ref('')
const result = ref<NeteaseData | null>(null)
const textarea = ref<HTMLTextAreaElement | null>(null)
const resultSectionRef = ref<HTMLElement | null>(null)

const neteaseExample = '分享古巨基的单曲《必杀技》: https://y.music.163.com/m/song?id=86943&userid=120620367&dlt=0846 (来自@网易云音乐)'
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
        errorMessage.value = '请输入网易云音乐链接'
        return
    }

    // 自动提取分享文本中的网易云音乐链接
    let extractedUrl = ''
    try {
        const urlRegex = /(https?:\/\/y\.music\.163\.com\/[^\s]+)/g
        const matches = inputText.match(urlRegex)
        if (matches && matches.length > 0) {
            extractedUrl = matches[0].replace(/[。，、；！？\s]/g, '')
        } else {
            error.value = true
            errorMessage.value = '未找到有效网易云音乐链接，请检查后重试'
            return
        }
    } catch {
        error.value = true
        errorMessage.value = '链接格式不正确，请检查后重试'
        return
    }

    loading.value = true
    error.value = false
    result.value = null

    try {
        // 直接传递提取的URL作为参数，不要预先编码
        const response = await fetchNeteaseData(extractedUrl)
        if (response.data.status === 200) {
            result.value = response.data
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

const downloadMusic = async () => {
    if (!result.value || !result.value.url) return
    await downloadFile(result.value.url, `${result.value.name} - ${result.value.ar_name}.mp3`)
}

/**
 * 美化歌词，弱化时间标签
 * 将 [00:12.34] 变为浅色小号字体
 */
const formatLyrics = (lyric: string) => {
    if (!lyric) return ''

    // 移除时间标记，只保留歌词文本
    return lyric
        .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '')
        .replace(/^(\s*\n)+/, '') // 去除开头的空行
        .replace(/(\n\s*)+$/, '') // 去除结尾的空行
}
</script>

<style scoped>
header {
    background: linear-gradient(90deg, #c20c0c, #e72d2d);
}

.music-info {
    display: flex;
    gap: 30px;
    background: #fff;
    padding: 30px 30px 24px 30px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    align-items: flex-start;
}

.music-cover {
    width: 180px;
    height: 180px;
    flex-shrink: 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(194, 12, 12, 0.08);
    background: #f7f7f7;
    display: flex;
    align-items: center;
    justify-content: center;
}

.music-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
}

.music-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    position: relative;
}

.music-details h2 {
    font-size: 1.5rem;
    margin-bottom: 8px;
    color: #c20c0c;
    font-weight: 700;
    word-break: break-all;
}

.music-details p {
    margin: 0;
    color: #555;
    font-size: 1rem;
    line-height: 1.7;
    word-break: break-all;
}

/* 新增：下载按钮与播放器排版优化 */
.music-player {
    margin: 18px 0 0 0;
    width: 100%;
    max-width: 350px;
    outline: none;
    border-radius: 6px;
}

.download-music {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin: 18px 0 0 0;
    padding: 0 18px;
    height: 42px;
    background: linear-gradient(90deg, #c20c0c, #e72d2d);
    color: #fff;
    border: none;
    border-radius: 22px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 600;
    gap: 8px;
    box-shadow: 0 2px 8px rgba(194, 12, 12, 0.08);
    transition: background 0.2s, transform 0.2s;
    position: absolute;
    right: 0;
    top: 0;
}

.download-music:hover {
    background: linear-gradient(90deg, #a80a0a, #c20c0c);
    transform: translateY(-2px) scale(1.04);
}

.lyrics {
    margin-top: 30px;
    background: #fff7f7;
    padding: 28px 0 24px 0;
    border-radius: 14px;
    box-shadow: 0 2px 12px rgba(194, 12, 12, 0.07);
    font-size: 1rem;
    color: #444;
    line-height: 1.8;
    overflow-x: auto;
    border: 1.5px solid #ffeaea;
    position: relative;
}

.lyrics h3 {
    margin-bottom: 18px;
    color: #c20c0c;
    font-size: 1.18rem;
    font-weight: 700;
    text-align: center;
    letter-spacing: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}
.lyric-box {
    /* background: linear-gradient(90deg, #fff0f0 0%, #fff 100%); */
    border-radius: 8px;
    padding: 18px 20px;
    overflow-y: auto;
    /* box-shadow: 0 1px 6px rgba(194, 12, 12, 0.04); */
    font-size: 1.03rem;
    color: #a00;
    line-height: 2;
    font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
    margin: 0 18px;
    text-align: center;
}
.lyric-box::-webkit-scrollbar {
    display: none;
}

.lyric-box pre {
    white-space: pre-wrap;
    background: none;
    margin: 0;
    padding: 0;
    font-family: inherit;
    color: inherit;
    font-size: inherit;
    line-height: 1.8;
    text-align: center;
}

/* 添加对空行的特殊处理 */
.lyric-box pre br {
    display: block;
    content: '';
    margin: 8px 0;
}

/* 移动端适配 */
@media (max-width: 900px) {
    .lyric-box {
        padding: 12px 10px;
        font-size: 0.95rem;
        line-height: 1.7;
    }
}

@media (max-width: 600px) {
    .lyric-box {
        padding: 10px 8px;
        font-size: 0.9rem;
        line-height: 1.6;
    }
}

.lyric-time {
    color: #bbb !important;
    font-size: 0.92em;
    font-style: italic;
    margin-right: 6px;
    opacity: 0.65;
    font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
    transition: color 0.2s;
    user-select: none;
}

@media (max-width: 900px) {
    .music-info {
        flex-direction: column;
        gap: 18px;
        padding: 18px 12px 12px 12px;
        width: 100%;
        border-radius: 0;
    }
    .music-cover {
        width: 140px;
        height: 140px;
        margin: 0 auto;
    }
    .music-details {
        width: 100%;
    }
    .music-player {
        max-width: 100%;
    }
    .lyrics {
        padding: 16px 0 12px 0;
    }
    .lyric-box {
        padding: 10px 8px;
        margin: 0 4px;
        font-size: 0.98rem;
    }

    .download-music {
        position: inherit;
    }
}

@media (max-width: 600px) {
    .music-info {
        padding: 20px 10px;
        gap: 10px;
        border-radius: 0;
        width: 100%;
        border-radius: 12px;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
    .music-cover {
        /* width: 100vw; */
        /* max-width: 100vw; */
        height: auto;
        aspect-ratio: 1/1;
        border-radius: 0;
    }
    .music-cover img {
        border-radius: 0;
    }
    .music-details {
        width: 100%;
        padding: 0 10px;
        box-sizing: border-box;
    }
    .music-player {
        width: 100%;
    }
    .download-music {
        width: 100%;
        min-width: 0;
        font-size: 0.98rem;
        height: 40px;
        margin: 14px 0 0 0;
    }
}
</style>
