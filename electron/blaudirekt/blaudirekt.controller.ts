import { ipcMain } from 'electron';
import { BlaudirektService } from './blaudirekt.service';
import { GRANT } from './jwk';

export function registerBlaudirektHandler() {
    // ipcMain.handle('api/blaudirekt/auth', async (_event) => await BlaudirektService.login());

    // ipcMain.handle('api/blaudirekt/ma', async (_event) => await BlaudirektService.ask(`${GRANT.sub}/vertraege`));
    ipcMain.handle('api/blaudirekt/ma', async (_event) => {
        const ma = await BlaudirektService.ask(`${GRANT.sub}/kunden/_search?q=m&from=0&size=10`);
        const contracts = await BlaudirektService.ask(`${GRANT.sub}/kunden/${ma[0].Id}/vertraege`);

        return contracts;
    });

    ipcMain.handle('api/blaudirekt/clients', async (_event) => await BlaudirektService.ask(`${GRANT.sub}/kunden/_search?q=m&from=0&size=10`));

    // ipcMain.handle('api/dropbox/refresh', async (_event, { refreshToken }) => await DropboxService.refreshToken(refreshToken));


}


