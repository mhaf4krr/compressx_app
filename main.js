const path = require("path")
const os = require("os")

const imagemin = require("imagemin")
const imageminMozjpeg  = require("imagemin-mozjpeg")
const imageminPngquant = require("imagemin-pngquant")
const slash = require("slash")
const log = require("electron-log")


const {app , BrowserWindow,Menu,globalShortcut, ipcMain,shell} = require("electron")


/* Check for Environment */

process.env.NODE_PROCESS = "production"

let isDev = process.env.NODE_PROCESS == "development" ? true : false

/* Check for Mac */
const isMac = process.platform == "darwin" ? true : false


let mainWindow



function createAboutWindow(){
    let aboutWindow = new BrowserWindow({
        title:"About ImageCompressor",
        width:500,
        height:600,
        resizable:false,

    })

    aboutWindow.loadFile("./app/about.html")
}

function createMainWindow(){
    mainWindow = new BrowserWindow({
        title:"Image Compressor",
        width:400,
        height:600,
        
        resizable:false,
        webPreferences:{
            nodeIntegration:true,
            webSecurity:false,
            devTools:false,
            enableRemoteModule: true,
       
        },
        
    })

    mainWindow.loadFile("./app/index.html")
}



app.on("ready",()=>{
    createMainWindow()

    const mainMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(mainMenu)


    /* Global Shortcut */
     
    // Shortcut for hot reload using Ctrl + R
    globalShortcut.register(
        "CmdOrCtrl+R",()=>{ mainWindow.reload()}
    )

    // Shortcut for dev tool toggle

    globalShortcut.register(
        "Ctrl+Shift+I",()=>{
            mainWindow.toggleDevTools()
        }
    )


    /* Garbage Collection */
    mainWindow.on("ready",()=>{
        mainWindow = null
    })
})


app.on("window-all-closed",()=>{
    if(!isMac){
        app.quit()
    }
})

app.on('activate',()=>{
    if(BrowserWindow.getAllWindows().length === 0){
        createMainWindow()
    }
})



/* IPC COMM */

ipcMain.on('image:minimize',(e,data)=>{
    data.dest = os.homedir()+"/Desktop/image_compressor"
    console.log(data)
    compressImage(data)
})


async function compressImage(data){
    try {

        const pngQuality = data.compressImage/100
        let files = []
        data.file_data.forEach((file)=>{
            files.push(slash(file.file_path))
        })


        const files_compress = await imagemin(files,{
            destination:data.dest,
            plugins:[
                imageminMozjpeg({quality:data.compression}),
                imageminPngquant({
                    quality:[pngQuality,pngQuality]
                })
            ]
        })

        console.log(files_compress)

       
        /* from window to renderer */

        mainWindow.webContents.send("image:done",{success:true})

    } catch (error) {
        console.log(error)
        log.error(error)
    }
}


/* Menu */

const menu = [
    {
        label:"File",
        submenu:[
            {
                label:"Quit",
                accelerator: 'CmdOrCtrl+W',
                click:()=>{app.quit()}
            },
            {
                label:"About",
                click:()=>{
                    createAboutWindow()
                }
            }
        ]
    }
]

/* Handle menu problem with  */
if(isMac){
    menu.unshift({ role: "appMenu"})
}
if(isDev){
    menu.push({
        label:"Developer",
        submenu:[
            {role:'reload'},
            {role:'forcereload'},
            {role:'seperator'},
            {role:'toggledevtools'}
        ]
    })
}