import axios from 'axios'
import type { ApiResponse } from '@/types/xhs'

const api = axios.create({
    baseURL: 'https://api.bugpk.com/api/xhsjx',
    validateStatus: status => (status && status >= 200 && status < 300) || status === 500
})

export const fetchXhsData = (url: string) => api.get<ApiResponse>('', { params: { url } })
