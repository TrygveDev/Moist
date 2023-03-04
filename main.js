// Modules to control application life and create native browser window
const log = require('electron-log');
const { autoUpdater } = require("electron-updater");
const { app, BrowserWindow, ipcMain, Menu, Tray, Notification } = require('electron')
const ipc = ipcMain
const settings = require('electron-settings');

var mainWindow;
const createWindow = async () => {
    mainWindow = new BrowserWindow({
        width: 300,
        height: 400,
        maxWidth: 300,
        maxHeight: 400,
        frame: false,
        autoHideMenuBar: true,
        resizable: false,
        icon: __dirname + `/app/images/icon.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })

    // and load the index.html of the app.
    mainWindow.loadFile('app/index.html')

    // Menu events
    ipc.on('hideMainWindow', (event) => {
        mainWindow.hide();
    })

    // Notification events
    ipc.on('showMainWindow', (event) => {
        mainWindow.show();
    })
    if (await settings.get('startMinimized')) {
        mainWindow.hide();
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

// Auto updater
let win;

function sendStatusToWindow(text) {
    log.info(text);
    win.webContents.send('message', text);
}
async function createDefaultWindow() {
    win = new BrowserWindow({
        width: 300,
        height: 250,
        minWidth: 300,
        minHeight: 250,
        maxWidth: 300,
        maxHeight: 250,
        resizable: false,
        frame: false,
        titleBarOverlay: {
            color: '#23272A',
            symbolColor: '#fff'
        },
        icon: __dirname + `/app/images/icon.png`,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });
    win.on('closed', () => {
        win = null;
    });
    win.loadURL(`file://${__dirname}/updater.html#v${app.getVersion()}`);
    if (await settings.get('startMinimized')) {
        win.hide();
    }
    return win;
}
autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', () => {
    sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('Newest version installed.');
    win.close();
    createWindow()
})
autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
})
autoUpdater.on('download-progress', (progressObj) => {
    sendStatusToWindow("Downloaded " + Math.round(progressObj.percent) + "%");
})
autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
    autoUpdater.quitAndInstall(false, true);
});
let tray;

app.on('ready', () => {
    createDefaultWindow();
    autoUpdater.checkForUpdates();
    createSettings()

    // UNCOMMENT IF NPM START IS USED
    win.close();
    createWindow();

    tray = new Tray(__dirname + `/app/images/icon.png`)
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open', type: 'normal', click: () => {
                mainWindow.show();
            }
        },
        {
            label: 'Exit', type: 'normal', click: () => {
                mainWindow.close();
                app.quit();
            }
        }
    ])
    tray.setToolTip('Moist')
    tray.setContextMenu(contextMenu)
    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
    })
});

const startUpSettings = async () => {
    await settings.get('startOnStartup').then((result) => {
        app.setLoginItemSettings({
            openAtLogin: result.startOnStartup,
        })
    })
}
startUpSettings()



const createSettings = async () => {
    const sett = await settings.get()
    if (Object.keys(sett).length === 0) {
        await settings.set('goal', 2500)
        await settings.set('remindToDrink', true)
        await settings.set('remindToDrinkInterval', 90)
        await settings.set('startMinimized', false)
        await settings.set('startOnStartup', true)
    }
}

ipcMain.on('saveSettings', async (event, arg) => {
    await settings.set('goal', arg[0])
    await settings.set('remindToDrink', arg[1])
    await settings.set('remindToDrinkInterval', arg[2])
    await settings.set('startMinimized', arg[3])
    await settings.set('startOnStartup', arg[4])
    startUpSettings()
})

ipcMain.handle('getSettings', async (event, arg) => {
    const sett = await settings.get()
    return sett
})