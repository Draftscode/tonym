import { BrowserWindow } from "electron";
const fetch = require('node-fetch');

type GdvRow = {
    name: string;
    image: string;
}

export class GdvService {
    static async getGdvMembers(q: string = 'A') {
        q = q || 'A';
        const letters = [q[0]?.toUpperCase()];

        const promises: Promise<GdvRow[]>[] = letters.map(letter => {
            const win = new BrowserWindow({
                show: false,
                webPreferences: {
                    offscreen: true // Enable offscreen rendering
                }
            });

            win.loadURL(`https://www.gdv.de/gdv/der-gdv/unsere-mitglieder?letter=${letter}`);

            // win.

            // Wait for page load
            return new Promise<GdvRow[]>((resolve, reject) => {

                win.webContents.on('did-finish-load', async () => {

                    try {
                        const html = await win.webContents.executeJavaScript(`
                        new Promise(resolve => {
                            const html = document;
                            const table = html.getElementsByClassName('ibmix-download-teaser')[0];
                            const rows = table.getElementsByTagName('li');
                            const items = Array.from(rows).map(r=>{
                                const img = r.getElementsByTagName('img')[0];
                                const name = r.getElementsByClassName('ibmix-download-teaser__item-headline')[0].textContent;
                                
                                return {
                                    image: img.src,
                                    name: name,
                                };
                            });
                            resolve(items);
                            });
                            `);

                        resolve(html);
                    } catch (e) {
                        reject(e);
                    }
                });
            });

        });

        const r = await Promise.all(promises);

        const items = r.flat().filter((item: GdvRow) => !q || item.name?.toLowerCase()?.includes(q.toLowerCase()));

        for (let idx = 0; idx < items.length; idx++) {
            items[idx].image = await imageUrlToBase64(items[idx].image);
        }

        return items;
    }
}

async function imageUrlToBase64(url: string) {
    const response = await fetch(url);
    const contentType = response.headers.get('content-type');
    const buffer = await response.buffer(); // Note: node-fetch supports .buffer()
    const base64 = buffer.toString('base64');
    return `data:${contentType};base64,${base64}`;
}