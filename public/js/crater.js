async function downloadImage(imageSrc, fileName) {
    const image = await fetch(imageSrc)
    const imageBlog = await image.blob()
    const imageURL = URL.createObjectURL(imageBlog)

    const link = document.createElement('a')
    link.href = imageURL
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
// $("document").ready(downloadImage(imgUrl))
$("document").ready(async ()=>{
    const res = await fetch(window.location.href + '/get')
    const data = await res.json()
    if (Array.isArray(data)){
        data.forEach((crater)=>{
            downloadImage(crater.url, crater.fileName)
        })
    }else{
        downloadImage(data.url)
    }
})
document.querySelector('h1').addEventListener('click', (e)=>{
    location.href = "/"
})