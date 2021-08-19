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
let uploading = false
let readers = []
let filenames = []
uploadButton.addEventListener('click', (ev)=>{
    ev.preventDefault()
    if (uploading) return alert("please wait while the files upload")
    input.onchange = async e => { 
        let files = e.currentTarget.files;
        if(!files.length) return
        for(let file of files){
            filenames.push(file.name)
            readers.push(readAsDataUrl(file))
        }
        const numOfFilesString = readers.length > 1 ? "files" : "file"
        document.getElementById('timerP').innerHTML = `${readers.length} ${numOfFilesString} ready to upload <button id="ok" onclick="upload()">Upload</button>`
        uploadButton.textContent = readers.length > 0 ? "Add more files" :"Add files"
    }
    input.click();
})
function upload(){
    document.getElementById('ok').disabled = true
    document.getElementById('loading').style.visibility = "visible"
    uploadButton.disabled = false
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
        uploading = false
        readers = []
        uploadButton.textContent = "Add files"
        document.getElementById('ok').disabled = false
        document.getElementById('loading').style.visibility = "hidden"
        const numOfFilesString = data.files > 1 ? "files" : "file"
        document.getElementById('timerP').textContent = `${data.files} ${numOfFilesString} uploaded\nCODE: ${data.code}`
        setTimeout(()=>{
            document.getElementById('timerP').textContent = ""
        }, 30000)
        
    });
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
    const data = await res.json()
    document.getElementById('loading').style.visibility = "hidden"
    if (data.error){
        cleanInputs()
        document.getElementById('info').textContent = data.error
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