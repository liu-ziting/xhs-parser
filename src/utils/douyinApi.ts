import axios from 'axios'
import type { DouyinApiResponse } from '@/types/douyin'

const api = axios.create({
    baseURL: 'https://api.bugpk.com/api/douyin',
    validateStatus: status => (status && status >= 200 && status < 300) || status === 500
})

export const fetchDouyinData = (url: string) => api.get<DouyinApiResponse>('', { params: { url } })
