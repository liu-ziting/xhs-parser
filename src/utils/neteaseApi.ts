import axios from 'axios'
import type { NeteaseApiResponse } from '@/types/netease'

const api = axios.create({
    baseURL: 'https://api.bugpk.com/api/163_music',
    validateStatus: status => (status && status >= 200 && status < 300) || status === 500
})

export const fetchNeteaseData = (url: string) => api.get<NeteaseApiResponse>(`?url=${encodeURIComponent(url)}&level=standard&type=json`)
