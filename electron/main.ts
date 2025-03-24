import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { startServer } from './server';

let mainWindow: BrowserWindow | null;
let nestProcess;
const IS_DEV = !app.isPackaged;
const ROOT_PATH = join(__dirname, '..');
const LOG_DIR_PATH = join(app.getPath('userData'), 'logs', 'electron');
const PORT = 3000;

log.transports.file.level = 'info';
autoUpdater.logger = log;

app.whenReady().then(() => {
    if (!existsSync(LOG_DIR_PATH)) {
        mkdirSync(LOG_DIR_PATH, { recursive: true });
    }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        },
    });

    // Start checking for updates
    autoUpdater.checkForUpdatesAndNotify();

    startServer(PORT);

    const url = IS_DEV
        ? 'http://localhost:4200' // Development
        : `file://${ROOT_PATH}/shell/browser/index.html`; // Production

    if (IS_DEV) {

        mainWindow.webContents.openDevTools(); // 👈 Opens DevTools on start
    }

    mainWindow.loadURL(url);

    mainWindow.on('closed', () => {
        mainWindow = null;

    });

    // Update Event Listeners
    autoUpdater.on('update-available', () => {
        log.info('Update available.');
        if (mainWindow) {
            mainWindow.webContents.send('update_available');
        }
    });

    autoUpdater.on('update-downloaded', () => {
        log.info('Update downloaded.');
        if (mainWindow) {
            mainWindow.webContents.send('update_downloaded');
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});

