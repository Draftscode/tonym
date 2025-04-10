
import log from 'electron-log';
import express from 'express';
import { renderPageWithPuppeteer } from './pdf';

export function startServer(port: number) {
    const server = express();

    server.use(express.json())

    server.post('/api/pdf', async (req, res) => {
        const contents = req.body;
        try {
            const pdfBuffer = await renderPageWithPuppeteer(contents.content);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="document.pdf"',
                'Content-Length': pdfBuffer.length,
            });
            log.info(`/api/pdf: send back buffer`);

            res.end(pdfBuffer);
        } catch (e: any) {
            log.error('[ERROR]', e.message)
        }
    });

    server.get('/api/ping', async (req, res) => {
        res.send({ ok: true });
    });

    server.listen(port, () => log.info(`Server running at http://localhost:${port}`));
}
