import { inject, Injectable, signal } from "@angular/core";
import { finalize, last, lastValueFrom, tap } from "rxjs";
import { DropboxDataResponse, ElectronService } from "./electron.service";

const DROPBOX_STORAGE_KEY = 'dropbox_access_token';

type AccessResponse = {
    access_token: string;
    account_id: string;
    expires_in: number;
    scope: string;
    token_type: "bearer";
    uid: string;
};

type DropboxFile = {
    ".tag": 'file';
    client_modified: string;
    content_hash: string;
    id: string;
    is_downloadable: boolean;
    name: string;
    path_display: string;
    path_lower: string;
    rev: string;
    server_modified: string;
    size: number;
}

@Injectable({ providedIn: 'root' })
export class FileService {
    private readonly electronService = inject(ElectronService);

    private readonly _token = signal<string | null>(null);
    private readonly _isLoading = signal<boolean>(false);

    constructor() {
        this._token.set(localStorage.getItem(DROPBOX_STORAGE_KEY));
        if (this._token()) {
            this.listFiles();
        }
    }

    private readonly _files = signal<DropboxFile[]>([]);

    async listFiles() {
        this._isLoading.set(true);
        await lastValueFrom(
            this.electronService.handle<DropboxDataResponse<DropboxFile[]>>('api/dropbox/files', this._token()).pipe(
                finalize(() => this._isLoading.set(false)),
                tap((d) => {
                    if (d.ok) {
                        console.log(d)
                        this._files.set(d.data);
                    } else {
                        this.clear();
                    }
                })
            ));
    }

    async deleteFile(filename: string) {
        await lastValueFrom(this.electronService.handle<void>('api/dropbox/files_delete', { token: this._token(), filename }).pipe(
            tap(() => this.listFiles()),
        ))
    }

    async writeFile<T>(filename: string, contents: T) {
        await lastValueFrom(this.electronService.handle('api/dropbox/files_create_or_update',
            { token: this._token(), filename, contents: JSON.stringify(contents) }).pipe(tap(() => {
                this.listFiles();
            })));
    }

    async readFile<T>(filename: string) {
        return await lastValueFrom(this.electronService.handle<T>('api/dropbox/files_read',
            { token: this._token(), filename }));
    }

    get isLoading() {
        return this._isLoading;
    }

    get files() {
        return this._files;
    }

    get isAuthenticated() {
        return this._token;
    }

    clear() {
        localStorage.removeItem(DROPBOX_STORAGE_KEY);
        this._token.set(null);
    }

    authentication() {
        return lastValueFrom(this.electronService.handle<AccessResponse>('api/dropbox/auth').pipe(
            tap(t => {
                console.log(t)
                this._token.set(t.access_token);
                localStorage.setItem(DROPBOX_STORAGE_KEY, t.access_token);
                this.listFiles();
            })
        ));
    }
}