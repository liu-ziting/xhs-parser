export interface PipixiaData {
    author: string
    userId?: string
    authorID?: string
    title: string
    desc: string
    avatar: string
    cover: string
    url: string
}

export interface PipixiaApiResponse {
    code: number
    msg: string
    data: PipixiaData
}
