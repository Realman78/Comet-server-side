let code = ""
const inputs = document.getElementsByClassName('digitInput')
const uploadButton = document.getElementById("uploadButton")
var input = document.getElementById('uploadFile');
window.onload = focusOnFirst()
//On key press, go to the next input
var charLimit = 1;

$(".digitInput").keydown(function(e) {
    var keys = [8, 9, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 144, 145];
    if (e.which == 8 && this.value.length == 0) {
        $(this).prev('.digitInput').focus();
    } else if ($.inArray(e.which, keys) >= 0) {
        return true;
    } else if (this.value.length >= charLimit) {
        $(this).next('.digitInput').focus();
        return false;
    } else if (e.shiftKey || e.which < 47 || (e.which > 58 && e.which < 96) || e.which > 105) {
        return false;
    }else if ((e.which > 47 && e.which < 58) || (e.which >= 96 && e.which <= 105)){
        this.value = e.key
        if (this.value.length >= charLimit) {
            $(this).next('.digitInput').focus();
            if (isFull()){
                document.getElementById('loading').style.visibility = "visible"
                redirectToCrater(code)
            }
            return false;
        }
    }
})
$(".digitInput").each( function () {
    var $this = $(this);
    if (parseInt($this.css("fontSize")) < 50) {
        $this.css({ "font-size": "50px" });   
    }
});
$("#first").keydown(function(e){
    if (e.ctrlKey && e.key == "v" && !uploading)
    {
        e.stopPropagation();
        e.preventDefault();

        navigator.clipboard.readText()
        .then(text => {
            if (text.length == 6 && /^\d+$/.test(text)) {
                for (let i = 0; i < inputs.length; i++){
                    inputs[i].value = text[i]
                    if (isFull()){
                        document.getElementById('loading').style.visibility = "visible"
                        redirectToCrater(code)
                    }
                }
            }
        })
        .catch(err => {
            console.error('Failed to read clipboard contents: ', err);
        });
    }
})
let uploading = false
let readers = []
let filenames = []
uploadButton.addEventListener('click', (ev)=>{
    ev.preventDefault()
    if (uploading) return alert("please wait while the files upload")
    input.click();
})
input.addEventListener('change', async (e)=>{
    e.preventDefault()
    let files = e.currentTarget.files;
    if(!files.length) return
    for(let file of files){
        filenames.push(file.name)
        readers.push(readAsDataUrl(file))
    }
    const numOfFilesString = readers.length > 1 ? "files" : "file"
    document.getElementById('timerP').innerHTML = `<button onclick="removeItems()" id="removeItemsButton"><i class="far fa-window-close"></i></button>${readers.length} ${numOfFilesString} ready to upload <button id="uploadToServerButton" onclick="upload()">Upload</button>`
    uploadButton.textContent = readers.length > 0 ? "Add more files" :"Add files"
})
function removeItems(){
    document.getElementById('timerP').textContent = ""
    uploadButton.textContent = "Add files"
    input.value = ""
    readers = []
    filenames = []
}
function upload(){
    document.getElementById('removeItemsButton').disabled = true
    document.getElementById('uploadToServerButton').disabled = true
    document.getElementById('loading').style.visibility = "visible"
    document.getElementById("last").disabled = true
    uploadButton.disabled = true
    uploading = true
    Promise.all(readers).then(async (values) => {
        const body = JSON.stringify({
            values,
            filenames
        })
        const res = await fetch(window.location.href + `api/upload`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body
        })
        const data = await res.json()
        console.log(data)
        uploadButton.disabled = false
        document.getElementById("last").disabled = false
        uploading = false
        readers = []
        filenames = []
        input.value = ""
        uploadButton.textContent = "Add files"
        document.getElementById('uploadToServerButton').disabled = false
        document.getElementById('removeItemsButton').disabled = false
        document.getElementById('loading').style.visibility = "hidden"
        if (data.uploadError){
            let message = `File(s) size too large. Max individual file size is 10MB.`
            document.getElementById('timerP').textContent = data.uploadError.message.includes("File size too large") ? message : "Something went wrong"
            return 
        }
        const numOfFilesString = data.files > 1 ? "files" : "file"
        document.getElementById('timerP').innerHTML = `${data.files} ${numOfFilesString} uploaded <span class="codeSpan">CODE: ${data.code}  <i onclick="copy(${data.code})" class="far fa-copy"></i></span>`
        setTimeout(()=>{
            document.getElementById('timerP').textContent = ""
        }, 300000)
        
    }).catch((e)=>{
        console.log(e)
        uploadButton.disabled = false
        document.getElementById("last").disabled = false
        uploading = false
        document.getElementById('uploadToServerButton').disabled = false
        document.getElementById('removeItemsButton').disabled = false
        document.getElementById('loading').style.visibility = "hidden"
        document.getElementById('timerP').textContent = "Something went wrong"
    })
}
function copy(string){
    navigator.clipboard.writeText(string);
    document.querySelector('.fa-copy').style.color = "green"
    setTimeout(()=>{
        document.querySelector('.fa-copy').style.color = "white"
    },2000)
}
function readAsDataUrl(file){
    return new Promise(function(resolve,reject){
        let fr = new FileReader();

        fr.onload = function(){
            resolve(fr.result);
        };

        fr.onerror = function(){
            reject(fr);
        };

        fr.readAsDataURL(file);
    });
}
function isFull(){
    code = ""
    for (const dig of inputs){
        code += dig.value
    }
    return code.length == 6
}
function cleanInputs(){
    for (const dig of inputs){
        dig.value = ''
    }
    focusOnFirst()
}
function focusOnFirst(){
    const $firstEl = $("#first")
    $firstEl.focus()
    return null
}
async function redirectToCrater(tmpCode){
    const res = await fetch(window.location.href + `${tmpCode}/get`)
        .catch((e)=>{
            document.getElementById('info').textContent = "Something went wrong"
            infoFadeout()
        })
    const data = await res.json()
    $("#info").stop(true,true)
    document.getElementById('loading').style.visibility = "hidden"
    if (data.error){
        cleanInputs()
        document.getElementById('info').style.display = "block"
        document.getElementById('info').textContent = data.error
        infoFadeout()
        return
    }
	
    if (Array.isArray(data)){
        let tmp = data[0].code
        location.href = `/${tmp}`
		cleanInputs()
        return
    }
	cleanInputs()
    location.href = `/${data.code}`
}

function infoFadeout(){
    setTimeout(()=>{
        $("#info").fadeOut(2000, ()=>{
            document.getElementById('info').textContent = ""
            document.getElementById('info').style.display = "block"
        })
    }, 5000)
}