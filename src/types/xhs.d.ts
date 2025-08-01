export interface XhsData {
    author: string
    userId?: string
    authorID?: string
    title: string
    desc: string
    avatar: string
    cover: string
    images?: string[]
    imgurl?: string[]
    url?: string
}

export interface ApiResponse {
    code: number
    msg: string
    data: XhsData
}
