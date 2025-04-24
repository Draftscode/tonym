import { BrowserWindow, ipcMain } from 'electron';

export function registerDropboxHandler() {
    const CLIENT_ID = 'brls8bkox6m412t';
    const CLIENT_SECRET = 'bovs1s7mfl51thw';

    ipcMain.handle('api/dropbox/auth', async (_event) => {
        return await authentication();
    });

    ipcMain.handle('api/dropbox/files_create_or_update',
        (_event, { token, filename, contents }) =>
            uploadToDropbox(token, filename, contents));

    ipcMain.handle('api/dropbox/files_read',
        (_event, { token, filename }) =>
            downloadFromDropbox(token, filename));

    ipcMain.handle('api/dropbox/files_delete',
        (_event, { token, filename }) =>
            deleteFromDropbox(token, filename));

    ipcMain.handle('api/dropbox/files', (_event, token) => listDropboxFiles(token));

    async function listDropboxFiles(accessToken: string) {
        const response = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: '', // empty string means root folder
                recursive: false
            })
        });
        const data = await response.json();
        if (!response.ok) {
            return { ok: false, cause: { message: response.statusText, status: response.status } };
        }

        return { ok: true, data: data.entries };

    }

    async function deleteFromDropbox(accessToken: string, path: string) {

        const response = await fetch('https://api.dropboxapi.com/2/files/delete_v2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ path: `/${path}` }) // e.g., "/my-folder/myfile.txt"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Delete failed: ${errorText}`);
        }

        const result = await response.json();
        return result;
    }

    async function uploadToDropbox(accessToken: string, path: string, contents: string | Blob | ArrayBuffer) {
        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/octet-stream',
                'Dropbox-API-Arg': JSON.stringify({
                    path: `/${path}`, // e.g., "/my-folder/file.txt"
                    mode: 'overwrite', // overwrite if exists
                    autorename: false,
                    mute: false,
                    strict_conflict: false
                })
            },
            body: contents
        });

        if (!response.ok) {


            const errorText = await response.text(); // 🔥 instead of response.json()
            console.error('Dropbox upload failed:', errorText);
            throw new Error(`Upload error: ${errorText}`);
        }

        const data = await response.json();
        return data;
    }

    async function downloadFromDropbox(accessToken: string, path: string): Promise<Blob> {
        const response = await fetch('https://content.dropboxapi.com/2/files/download', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Dropbox-API-Arg': JSON.stringify({ path: `/${path}` }) // e.g. '/my-folder/file.txt'
            }
        });

        if (!response.ok) {
            const errorText = await response.text(); // Dropbox errors may not be JSON
            throw new Error(`Dropbox download failed: ${errorText}`);
        }

        const blob = await response.blob();
        const text = await blob.text();
        return JSON.parse(text);
    }

    function authentication() {
        return new Promise((resolve, reject) => {

            const AUTH_URL = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}`;
            const authWindow = new BrowserWindow({
                width: 600,
                height: 800,
                show: true,
                webPreferences: { nodeIntegration: false }
            });

            authWindow.loadURL(AUTH_URL);

            authWindow.webContents.on('will-redirect', (event, url) => {
                const matched = url.match(/[?&]auth_code=([^&]+)/);
                if (matched) {
                    const code = matched[1];
                    authWindow.close(); // Done with auth window

                    // You can now exchange the code for an access token
                    exchangeCodeForToken(code);
                }
            });

            // Optional fallback in case Dropbox loads a confirmation page with the code in body
            authWindow.webContents.on('did-finish-load', async () => {
                const currentUrl = authWindow.webContents.getURL();
                if (currentUrl.includes('code=')) return;

                try {
                    const content = await authWindow.webContents.executeJavaScript('document.body.innerText');
                    const codeMatch = content.match(/auth_code:\s*([a-zA-Z0-9_-]+)/);
                    if (codeMatch) {
                        const code = codeMatch[1];
                        authWindow.close();
                        exchangeCodeForToken(code);
                    }
                } catch (err) {
                    console.error('Error reading code from page:', err);
                    reject(err);
                }
            });

            async function exchangeCodeForToken(authCode: string) {
                const fetch = require('node-fetch');

                const params = new URLSearchParams();
                params.append('code', authCode);
                params.append('grant_type', 'authorization_code');
                params.append('client_id', CLIENT_ID);
                params.append('client_secret', CLIENT_SECRET);

                try {
                    const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: params.toString()
                    });
                    const token = await response.json();

                    resolve(token);
                } catch (e) {
                    reject(e);
                }
            }

        })
    }
}
