import { ipcMain } from "electron";
import { GdvService } from "./gdv.service";

export function registerGdvHandler() {
    ipcMain.handle('api/gdv/members', async (_event, { query }) => await GdvService.getGdvMembers(query));
}