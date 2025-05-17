import { computed, inject, Injectable, signal } from "@angular/core";
import { finalize, lastValueFrom, switchMap, tap } from "rxjs";
import { DropboxDataResponse, DropboxDataResponseError, ElectronService } from "./electron.service";

const DROPBOX_STORAGE_KEY = 'dropbox_access_token';

type AccessResponse = {
    access_token: string;
    account_id: string;
    expires_in: number;
    scope: string;
    token_type: "bearer";
    uid: string;
    refresh_token: string;
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
    private readonly _isLoading = signal<boolean>(false);

    private readonly _accessInfo = signal<AccessResponse | null>(null);

    constructor() {
        try {
            const data = localStorage.getItem(DROPBOX_STORAGE_KEY);
            if (data) {
                const accessInfo = JSON.parse(data);

                this._accessInfo.set(accessInfo);

                if (this._accessInfo()?.access_token) {
                    this.listFiles();
                }
            }
        } catch (e) {
            console.warn('[auth] could not retreive access token information');
        }
    }

    async logout() {
        this._isLoading.set(true);
        await lastValueFrom(
            this.electronService.handle<void>('api/dropbox/logout', { accessToken: this._accessInfo()?.access_token }).pipe(
                finalize(() => {
                    this._isLoading.set(false);
                    this.clearAccessInfo();
                })));


    }

    private readonly _files = signal<DropboxFile[]>([]);

    async listFiles() {
        this._isLoading.set(true);
        await lastValueFrom(
            this.electronService.handle<DropboxDataResponse<DropboxFile[]>>('api/dropbox/files', this._accessInfo()?.access_token).pipe(
                finalize(() => this._isLoading.set(false)),
                tap((d) => {
                    if (d.ok) {
                        this._files.set(d.data);
                    } else {
                        this.handleErrors(d);
                    }
                })
            ));
    }

    async handleErrors(e: DropboxDataResponseError) {
        if (e.cause.status === 401 && this._accessInfo()?.refresh_token) {
            try {
                await this.refreshToken();
                await this.listFiles();
            } catch (e) {
                this.clearAccessInfo();
                console.error('[auth]', e);
            }
        } else {
            this.clearAccessInfo();
        }
    }

    private storeAccessInfo(d: AccessResponse) {
        const curInfo: AccessResponse = { ...this._accessInfo() ?? {}, ...d ?? {} };
        localStorage.setItem(DROPBOX_STORAGE_KEY, JSON.stringify(curInfo));
        this._accessInfo.update(info => ({ ...info ?? {}, ...d ?? {} }));
    }

    async refreshToken() {
        this._isLoading.set(true);
        setTimeout(async () => {

            await lastValueFrom(
                this.electronService.handle<AccessResponse>('api/dropbox/refresh', { refreshToken: this._accessInfo()?.refresh_token }).pipe(
                    finalize(() => this._isLoading.set(false)),
                    tap((d) => {
                        if (d?.access_token) {
                            this.storeAccessInfo(d);
                        } else {
                            this.clearAccessInfo();
                        }
                    })
                ));
        }, 4000);
    }

    async renameFile(fileId: string, toPath: string) {
        this._isLoading.set(true);
        try {
            const original = this._files().find(file => file.id === fileId);
            if (original) {
                await lastValueFrom(this.electronService.handle<void>('api/dropbox/files_move', { token: this._accessInfo()?.access_token, fromPath: original.name, toPath }).pipe(
                    switchMap(() => this.listFiles())
                ));
            }
        } finally {
            this._isLoading.set(false);
        }
    }

    async deleteFile(filename: string) {
        this._isLoading.set(true);
        try {
            await lastValueFrom(this.electronService.handle<void>('api/dropbox/files_delete', { token: this._accessInfo()?.access_token, filename }).pipe(
                tap(() => this.listFiles()),
            ));
        } finally {
            this._isLoading.set(false);
        }
    }

    async writeFile<T>(filename: string, contents: T) {
        await lastValueFrom(this.electronService.handle('api/dropbox/files_create_or_update',
            { token: this._accessInfo()?.access_token, filename, contents: JSON.stringify(contents) }).pipe(tap(() => {
                this.listFiles();
            })));
    }

    async readFile<T>(filename: string) {
        return await lastValueFrom(this.electronService.handle<T>('api/dropbox/files_read',
            { token: this._accessInfo()?.access_token, filename }));
    }

    get isLoading() {
        return this._isLoading;
    }

    get files() {
        return this._files;
    }


    isAuthenticated = computed(() => !!this._accessInfo()?.access_token);

    clearAccessInfo() {
        localStorage.removeItem(DROPBOX_STORAGE_KEY);
        this._accessInfo.set(null);
        this._files.set([]);
    }

    authentication() {
        return lastValueFrom(this.electronService.handle<AccessResponse>('api/dropbox/auth').pipe(
            tap(t => {
                if (t.access_token) {
                    this.storeAccessInfo(t);
                    this.listFiles();
                }
            })
        ));
    }

}