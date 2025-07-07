import axios from 'axios'
import type { PipixiaApiResponse } from '@/types/pipixia'

const api = axios.create({
    baseURL: 'https://api.bugpk.com/api/pipixia',
    validateStatus: status => (status && status >= 200 && status < 300) || status === 500
})

export const fetchPipixiaData = (url: string) => api.get<PipixiaApiResponse>('', { params: { url } })
