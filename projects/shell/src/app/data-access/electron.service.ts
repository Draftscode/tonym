import { Injectable, signal } from "@angular/core";

declare global {
    interface Window {
        electron: {
            invoke: <T, D = unknown>(type: string, ...data: D[]) => Promise<T>;
            send: (type: string) => void;
            on: (type: string, cb: () => void) => void;
        };
    }
}

export type TFile = {
    name: string;
    isDirectory: boolean;
    size: number;
    createdAt: string;
    modifiedAt: string;
}

@Injectable({ providedIn: 'root' })
export class ElectronService {
    isUpdateAvailable = signal<boolean>(false);
    isUpdateDownloaded = signal<boolean>(false);

    files = signal<TFile[]>([]);


    private onUpdate() {
        window.electron.on('update_available', () => {
            this.isUpdateAvailable.set(true);
        });

        window.electron.on('update_downloaded', () => {
            this.isUpdateDownloaded.set(true);
        });
    }

    restartApp() {
        window.electron.send('restart_app');
    }

    async readDir() {
        const files = await window.electron.invoke<TFile[]>('read_dir');
        this.files.set(files);
    }

    async writeFile<T>(filename: string, content: T) {
        await window.electron.invoke('write_file', { filename, content });
        await this.readDir();
    }

    async readFile<T = unknown>(filename: string) {
        return window.electron.invoke<T>('read_file', { filename });
    }

    async readLogs<T = unknown>() {
        return window.electron.invoke<T>('read_logs');
    }

    async deleteFile<T = unknown>(filename: string) {
        await window.electron.invoke<T>('delete_file', { filename });
        this.readDir();
    }

    constructor() {
        this.onUpdate();
        this.readDir();
    }
}