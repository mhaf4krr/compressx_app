const path = require("path")
const os = require("os")

const audio_player = document.querySelector("#audio_player")

const loading_screen = document.querySelector(".screen_loading")

const {ipcRenderer} = require("electron")


/* progress bar */

let file_progress_container = document.querySelector(".status")

let file_list_ul = document.querySelector("ul.file_list")
/* form fields  */

function generateFileListItem(name){
    return `<li>
    <i class="fa fa-file" aria-hidden="true"></i>
    <span>${name}</span>
    </li>`
}

const form = document.querySelector("form")
const files = document.querySelector("#files")
const compression_value = document.querySelector("#quality_slider")


function setOutputPath(){
    document.querySelector("#output_path").textContent= os.homedir()+"/Desktop/image_compressor/"
}

setOutputPath()

form.addEventListener("submit",(e)=>{
    e.preventDefault()

    handleClick("click")

    let file_list = ""

    let file_data = []


    for(let i=0 ;i< files.files.length ;i++){

        let file = files.files[i]
        file_data.push({
            file_name:file.name,
            file_path:file.path
    })

        file_list += generateFileListItem(file.name)

}

    file_list_ul.innerHTML = file_list

    let data = {
        file_data,
        compression:compression_value.value
    }


    console.log(data)


    ipcRenderer.send("image:minimize",data)
})

function handleClick(event){
    console.log("Inside Handle Click")
    let temp
    switch(event){
        case "click":
            loading_screen.style.display = "flex"
            break;

        case "complete":
            loading_screen.style.display = "none"
            break;
    }

}

function handleDone(){
    audio_player.src = "sounds/done.wav"
    audio_player.play()
}

/* Event Listener */


ipcRenderer.on("image:done",()=>{
    console.log("DONE")
    handleClick("complete")
    handleDone()
})
