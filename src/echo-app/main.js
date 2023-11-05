const { app, BrowserWindow, shell } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: "./build/icon.png",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const handleRedirect = (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  };
  mainWindow.webContents.on("will-navigate", handleRedirect);

  mainWindow.loadFile(path.join(__dirname, "index.html"));

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});
