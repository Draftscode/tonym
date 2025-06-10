import { BrowserWindow } from "electron";

// Basti
// const CLIENT_ID = '57ar8edt0ljrz6u';
// const CLIENT_SECRET = '4j6otu8w8zl35iw';

// Tony
const CLIENT_ID = 'brls8bkox6m412t';
const CLIENT_SECRET = 'bovs1s7mfl51thw';

export class DropboxService {
    static async listDropboxFiles(accessToken: string, query: string | undefined = undefined) {
        if (query) {
            const response = await fetch('https://api.dropboxapi.com/2/files/search_v2', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query,
                    options: {
                        filenameOnly: true,
                        file_status: 'active', // only active files
                        max_results: 100, // adjust as needed
                    },
                    path: '', // empty string means root folder
                    recursive: false
                })
            });
            const data = await response.json();
            if (!response.ok) {
                return { ok: false, cause: { message: response.statusText, status: response.status } };
            }
            return { ok: true, data: data.matches?.map((d: any) => d.metadata.metadata) };
        } else {
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
    }

    static async deleteFromDropbox(accessToken: string, path: string) {

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

    static async moveFile(accessToken: string, fromPath: string, toPath: string) {
        const response = await fetch('https://api.dropboxapi.com/2/files/move_v2', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from_path: `/${fromPath}`, // e.g., "/my-folder/file.txt"
                to_path: `/${toPath}`,
                autorename: false,
                allow_ownership_transfer: false
            })
        });

        if (!response.ok) {

            const errorText = await response.text(); // 🔥 instead of response.json()
            console.error('Dropbox moving file failed:', errorText);
            throw new Error(`Upload error: ${errorText}`);
        }

        const data = await response.json();
        return data;
    }

    static async uploadToDropbox(accessToken: string, path: string, contents: string | Blob | ArrayBuffer, renamed: string | null = null) {
        try {
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

                return {
                    ok: false,
                    cause: { message: response.statusText, status: response.status }

                }
            }

            const data = await response.json();
            return {
                ok: true,
                data
            };
        } catch (e: any) {
            return {
                ok: false,
                cause: e,
            };
        }
    }

    static async downloadFromDropbox(accessToken: string, path: string): Promise<Blob> {
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

    static async authentication() {
        return new Promise((resolve, reject) => {

            const AUTH_URL = `https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&token_access_type=offline`;
            const authWindow = new BrowserWindow({
                width: 600,
                height: 800,
                show: true,
                titleBarStyle: 'default',
                webPreferences: { nodeIntegration: false }
            });


            authWindow.removeMenu();

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


    static async refreshToken(refreshToken: string) {
        const response = await fetch('https://api.dropboxapi.com/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
            }),
        });

        if (!response.ok) {
            return { ok: false, cause: { message: response.statusText, status: response.status } };
        }

        const data = await response.json();
        return data; // Use this for further API calls
    }


    static async revokeDropboxToken(accessToken: string) {
        const fetch = require('node-fetch');

        const response = await fetch('https://api.dropboxapi.com/2/auth/token/revoke', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            return { ok: false, cause: { message: response.statusText, status: response.status } };
        }

    }
}