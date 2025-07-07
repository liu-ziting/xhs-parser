export async function downloadFile(url: string, filename: string) {
    try {
        const response = await fetch(url)
        const blob = await response.blob()
        const blobUrl = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        setTimeout(() => {
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        }, 100)
    } catch (e) {
        // fallback
        const fallbackLink = document.createElement('a')
        fallbackLink.href = url
        fallbackLink.download = filename
        fallbackLink.target = '_blank'
        document.body.appendChild(fallbackLink)
        fallbackLink.click()
        document.body.removeChild(fallbackLink)
    }
}
