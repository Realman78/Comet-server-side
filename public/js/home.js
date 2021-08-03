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