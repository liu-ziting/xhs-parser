export interface DouyinData {
    author: string
    userId?: string
    authorID?: string
    title: string
    desc: string
    avatar: string
    cover: string
    url: string
}

export interface DouyinApiResponse {
    code: number
    msg: string
    data: DouyinData
}
