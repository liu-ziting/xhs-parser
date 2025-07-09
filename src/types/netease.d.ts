export interface NeteaseData {
    WebAuther: string
    Website: string
    al_name: string
    ar_name: string
    level: string
    lyric: string
    name: string
    pic: string
    size: string
    status: number
    tlyric: string
    url: string
}

export interface NeteaseApiResponse {
    code: number
    msg?: string
    data: NeteaseData
}
