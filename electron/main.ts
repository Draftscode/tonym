import { app, BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { registerDropboxHandler } from './dropbox/dropbox.controller';
import { registerFileHandler } from './file.handle';
import { registerGdvHandler } from './gdv/gdv.controller';
import { registerPdfHandler } from './pdf';
import { registerBlaudirektHandler } from './blaudirekt/blaudirekt.controller';


let mainWindow: BrowserWindow | null;
const IS_DEV = !app.isPackaged;
const ROOT_PATH = join(__dirname, '..');
const LOG_DIR_PATH = join(app.getPath('userData'), 'logs', 'electron');

log.transports.file.level = 'info';
autoUpdater.logger = log;

app.whenReady().then(() => {
    const logPath = join(app.getPath('appData'), 'tonym', 'logs');

    if (!existsSync(logPath)) {
        mkdirSync(logPath, { recursive: true });
    }

    log.initialize();
    log.transports.console.format = '{h}:{i}:{s} {text}';
    log.transports.file.resolvePathFn = () => join(logPath, 'main.log');

    log.info('App ready!');

    if (!existsSync(LOG_DIR_PATH)) {
        mkdirSync(LOG_DIR_PATH, { recursive: true });
    }

    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        titleBarStyle: 'default',
        webPreferences: {
            preload: join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        },
    });



    // Start checking for updates
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
        log.error('Error checking for updates:', err);
    });

    const url = IS_DEV
        ? 'http://localhost:4207' // Development
        : `file://${ROOT_PATH}/shell/browser/index.html`; // Production

    mainWindow.removeMenu();

    if (IS_DEV) {
        mainWindow.webContents.openDevTools(); // 👈 Opens DevTools on start
    } else {
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

    registerDropboxHandler();
    registerPdfHandler();
    registerFileHandler();
    registerGdvHandler();
    registerBlaudirektHandler();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});


ipcMain.on('restart_app', () => {
    autoUpdater.quitAndInstall();
});


ipcMain.on('close_app', () => {
    app.quit();
});
