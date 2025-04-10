import { app, ipcMain } from "electron";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "fs";
import { join } from 'path';

export function registerFileHandler() {

    const appFolder = join(app.getPath('documents'), 'tonym');

    ipcMain.handle('read_dir', () => {
        if (!existsSync(appFolder)) {
            mkdirSync(appFolder, { recursive: true });
        }

        return readdirSync(appFolder, { withFileTypes: true }).map((entry) => {
            const filePath = join(appFolder, entry.name);
            const stats = statSync(filePath);

            return {
                name: entry.name,
                isDirectory: entry.isDirectory(),
                size: stats.size, // File size in bytes
                createdAt: stats.birthtime, // File creation date
                modifiedAt: stats.mtime, // Last modified date
            };
        });
    });

    ipcMain.handle('read_file', (_event, { filename }) => {
        if (!existsSync(appFolder)) {
            mkdirSync(appFolder, { recursive: true });
        }

        const filePath = join(appFolder, filename);

        if (!existsSync(filePath)) {
            throw new Error(`File "${filename}" not found.`);
        }

        const contents = readFileSync(filePath, 'utf-8'); // ✅ Convert Buffer to string
        return JSON.parse(contents); // ✅ Parse JSON string
    });


    ipcMain.handle('read_logs', (_event) => {
        const logPath = join(app.getPath('appData'), 'tonym', 'logs');

        if (!existsSync(logPath)) {
            return;
        }

        const filePath = join(logPath, 'main.log');

        if (!existsSync(filePath)) {
            throw new Error(`File "${filePath}" not found.`);
        }

        const contents = readFileSync(filePath, 'utf-8'); // ✅ Convert Buffer to string
        return contents; // ✅ Parse JSON string
    });

    ipcMain.handle('delete_file', (_event, { filename }) => {
        try {
            const filePath = join(appFolder, filename);

            if (!existsSync(filePath)) {
                throw new Error(`File "${filename}" not found.`);
            }

            unlinkSync(filePath); // ✅ Delete the file
            return { success: true, message: `Deleted ${filename}` };
        } catch (error: any) {
            console.error('File Delete Error:', error);
            return { success: false, error: error.message };
        }
    });



    ipcMain.handle('write_file', (_event, data) => {
        try {
            if (!existsSync(appFolder)) {
                mkdirSync(appFolder, { recursive: true });
            }

            const filePath = join(appFolder, `${data.filename}.json`);
            const jsonData = JSON.stringify(data.content, null, 2);
            writeFileSync(filePath, jsonData, 'utf-8'); // Specify encoding

            return { success: true, path: filePath };
        } catch (error: any) {
            console.error('File Write Error:', error);
            return { success: false, error: error.message };
        }
    });


}