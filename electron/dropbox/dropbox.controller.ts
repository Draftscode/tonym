import { ipcMain } from 'electron';
import { DropboxService } from './dropbox.service';

export function registerDropboxHandler() {
    ipcMain.handle('api/dropbox/auth', async (_event) => await DropboxService.authentication());

    ipcMain.handle('api/dropbox/logout', async (_event, { accessToken }) => await DropboxService.revokeDropboxToken(accessToken));

    ipcMain.handle('api/dropbox/refresh', async (_event, { refreshToken }) => await DropboxService.refreshToken(refreshToken));

    ipcMain.handle('api/dropbox/files_create_or_update',
        (_event, { token, filename, contents }) => DropboxService.uploadToDropbox(token, filename, contents));


    ipcMain.handle('api/dropbox/files_move',
        (_event, { token, fromPath, toPath }) =>
            DropboxService.moveFile(token, fromPath, toPath));

    ipcMain.handle('api/dropbox/files_read',
        (_event, { token, filename }) =>
            DropboxService.downloadFromDropbox(token, filename));

    ipcMain.handle('api/dropbox/files_delete',
        (_event, { token, filename }) =>
            DropboxService.deleteFromDropbox(token, filename));

    ipcMain.handle('api/dropbox/files', (_event, { token, query }) => DropboxService.listDropboxFiles(token, query));
}
