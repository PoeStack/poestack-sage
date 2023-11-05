const {app, BrowserWindow, shell} = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    require('@electron/remote/main').initialize()

    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        icon: "./build/icon.png",
        frame: false,
        backgroundColor: "#303338",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    require("@electron/remote/main").enable(mainWindow.webContents)
    const handleRedirect = (e, url) => {
        e.preventDefault()
        shell.openExternal(url)
    }
    mainWindow.webContents.on('will-navigate', handleRedirect)

    mainWindow.loadFile(path.join(__dirname, 'index.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}


app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});