import { ipcMain } from 'electron';
import { FileService } from '../file.service';
import { BlaudirektService } from './blaudirekt.service';
import { GRANT } from './jwk';

const COMPANY_FILE_NAME = 'tonym-companies';
const DIVISION_FILE_NAME = 'tonym-divisions';
const MAX_DIFF = 1000 * 60 * 24 * 1; // one day

export function registerBlaudirektHandler() {

    ipcMain.handle('api/blaudirekt/contracts', async (_event, { customerId }) => {
        const contracts = await BlaudirektService.ask(`${GRANT.sub}/kunden/${customerId}/vertraege`);
        return contracts;
    });

    ipcMain.handle('api/blaudirekt/clients', async (_event) => await BlaudirektService.ask(`${GRANT.sub}/kunden/_search?q=m&from=0&size=10`));


    ipcMain.handle('api/blaudirekt/divisions', async (_event) => {

        const file = FileService.readFile(DIVISION_FILE_NAME);
        const now = Date.now();

        const localDivisionsStore = JSON.parse(file ?? '{}');
        const timestamp = localDivisionsStore?.timestamp ? new Date(localDivisionsStore.timestamp).getTime() : 0;
        const diff = now - timestamp;

        if (!file || diff >= MAX_DIFF) {
            const divisions = await BlaudirektService.ask(`sparten`);
            FileService.writeFile(DIVISION_FILE_NAME, JSON.stringify({ timestamp: Date.now(), items: divisions }));
            return divisions;
        }

        return localDivisionsStore.items;


    });

    ipcMain.handle('api/blaudirekt/companies', async (_event, { }) => {
        const file = FileService.readFile(COMPANY_FILE_NAME);
        const now = Date.now();

        const localCompanyStore = JSON.parse(file ?? '{}');
        const timestamp = localCompanyStore?.timestamp ? new Date(localCompanyStore.timestamp).getTime() : 0;
        const diff = now - timestamp;

        if (!file || diff >= MAX_DIFF) {
            const companies = await BlaudirektService.ask(`${GRANT.sub}/gesellschaften`);
            FileService.writeFile(COMPANY_FILE_NAME, JSON.stringify({ timestamp: Date.now(), items: companies }));
            return companies;
        }

        return localCompanyStore.items;
    });
}


