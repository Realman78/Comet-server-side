const joinButton = document.getElementById('joinButton')
const inp = document.getElementById('codeInput')
joinButton.addEventListener('click', (e)=>{
    e.preventDefault()
    redirectToCrater()
})
inp.addEventListener('keyup', (e)=>{
    if (e.key == "Enter"){
        redirectToCrater()
    }
})
function redirectToCrater(){
    let code = inp.value.trim()
    location.href = `/${code}`
}