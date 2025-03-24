
import express from 'express';

import { renderPageWithPuppeteer } from './pdf';

export function startServer(port: number) {
    const server = express();

    server.use(express.json())
    
    server.post('/api/pdf', async (req, res) => {
        const contents = req.body;
        console.log('IN-->', contents)


        const pdfBuffer = await renderPageWithPuppeteer(contents);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="document.pdf"',
            'Content-Length': pdfBuffer.length,
        });

        res.end(pdfBuffer);
    });

    server.get('/api/ping', async (req, res) => {
        res.send({ ok: true });
    });

    server.listen(port, () => console.log(`Server running at http://localhost:${port}`));
}