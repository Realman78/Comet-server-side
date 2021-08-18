let code = ""
const inputs = document.getElementsByClassName('digitInput')

window.onload = focusOnFirst()
//On key press, go to the next input
var charLimit = 1;
$(".digitInput").keydown(function(e) {
    console.log((e.which > 47 && e.which < 58) || (e.which >= 96 && e.which <= 105))
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
document.getElementById("uploadButton").addEventListener('click', (ev)=>{
    ev.preventDefault()
    var input = document.createElement('input');
    input.type = 'file';
    input.multiple = "multiple"
    input.onchange = async e => { 
        let files = e.currentTarget.files;
        if(!files.length) return;

        for(let file of files){
            blobToDataURL(file, async (result)=>  {
                let filesBody = {}
                var filename = file.name;

                filesBody["filename"] = filename
                filesBody["url"] =  result
                const body = JSON.stringify({
                    values: filesBody
                })
                
                fetch(window.location.href + `api/upload`, {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body
                })
            })
            
        }

        
        // Promise.all(readers).then(async (values) => {
        //     console.log(values)
        //     const body = JSON.stringify({
        //         values
        //     })
        //     const res = await fetch(window.location.href + `api/upload`, {
        //         method: "POST",
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Accept': 'application/json'
        //         },
        //         body
        //     })
        //     const data = await res.json()
        //     console.log(data)
        // });
    }
    input.click();
})
function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);}
    a.readAsDataURL(blob);
}
function readAsDataUrl(file){
    let fr = new FileReader();
    // fr.addEventListener('load', ()=>{
    //     return fr.result
    // })
    // let ok = await fr.readAsDataURL(file)
    return URL.createObjectURL(file)
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