import { ipcMain } from "electron";
import { FileService } from "./file.service";



export function registerFileHandler() {
    ipcMain.handle('read_dir', () => FileService.readDirectory());
    ipcMain.handle('read_file', (_event, { filename }) => FileService.readFile(filename));
    ipcMain.handle('read_logs', (_event) => FileService.readLogs());
    ipcMain.handle('delete_file', (_event, { filename }) => FileService.deleteFile(filename));
    ipcMain.handle('write_file', (_event, { filename, content }) => FileService.writeFile(__filename, content));
}