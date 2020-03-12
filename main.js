const { app, BrowserWindow, dialog, ipcMain  } = require('electron');
const path = require('path');
const fs = require('fs');
const child = require('child_process');
const vlcExePath = "C:\\Program Files\\VideoLAN\\VLC\\vlc.exe";

async function init () {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true
        }
    });

    // and load the index.html of the app.
    await win.loadFile('index.html');

    win.webContents.openDevTools();

    ipcMain.on('select-dir', async (event, arg) => {
        const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory']
        });
        console.log('directories selected', result.filePaths);

        handleDirSelect(result.filePaths[0]);
    })
}

function handleDirSelect(dirPath){

    const mp3OutputDirName = path.join(dirPath, 'mp3_output');
    if (!fs.existsSync(mp3OutputDirName)){
        fs.mkdirSync(mp3OutputDirName);
    }

    fs.readdir(dirPath, (err, files) => {
        files.forEach(file => {
            try{
                if ( file.substr(-1*('wav'.length+1)) === '.' + 'wav' )
                {
                    const track = path.join(dirPath, file);
                    const filename = path.basename(file, '.wav');
                    const dstFile = path.join(mp3OutputDirName, `${filename}.mp3`);


                    // if(fs.existsSync(dstFile)){
                    //     console.log('----FILE EXISTS');
                    //     console.log(dstFile);
                    //     fs.unlinkSync(dstFile);
                    // }

                    const convert = `-I dummy -vvv --sout=#transcode{acodec=mp3,ab=320,channels=2,samplerate=48000}:std{access=file,mux=dummy,dst="${dstFile}"} vlc://quit"`;
                    const command = `"${vlcExePath}" "${track}" ${convert}`;

                    console.log(command);

                    child.exec(command, function(err, data) {
                        if(err){
                            console.error(err);
                            return;
                        }

                        console.log(data.toString());
                    });
                }


            }catch (e) {
                console.error(e)
            }

        });
    });

}

app.whenReady().then(init);
