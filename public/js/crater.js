async function downloadImage(imageSrc) {
    const arr = imageSrc.split('.')
    const ext = arr[arr.length-1]
 
    const image = await fetch(imageSrc)
    const imageBlog = await image.blob()
    const imageURL = URL.createObjectURL(imageBlog)

    const link = document.createElement('a')
    link.href = imageURL
    link.download = `${code}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
$("document").ready(downloadImage(imgUrl))