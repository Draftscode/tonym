import { BrowserWindow } from 'electron';

// Function to render a webpage using Puppeteer
export async function renderPageWithPuppeteer(html: string): Promise<Uint8Array<ArrayBufferLike>> {
    const window = new BrowserWindow({
        show: false,
        webPreferences: {
            offscreen: true // Enable offscreen rendering
        }
    });

    const loadPromise = new Promise<void>((resolve) => {
        window.webContents.once('did-finish-load', resolve);
    });

    await window.loadURL(`data:text/html,${encodeURIComponent(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>PDF Export</title>
    <style>
        body {
            font-family: "Arial", "Roboto", "Noto Sans", sans-serif;
            font-size: 16px;
        }
    </style>
</head>
<body>
     ${html}
</body>
</html>`)}`);
    await loadPromise;


    const pdfBuffer = await window.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,

        displayHeaderFooter: true,  // Enable header and footer
        headerTemplate: `
        <div class="pdf-header">

        </div>
        <style>
        /* General table styles */
            .pdf-header { 
                font-size: 12px; 
                text-align: center; 
                padding: 10px; 
            }
            /* Hide header on page 1 */
            .pdf-header[page="1"] { display: none; }  
        </style>`,
        footerTemplate: `
            <div style="width: 100%; font-size: 12px; text-align: center; padding: 10px;">
                <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
            </div>`,
    });
    window.destroy(); // Clean up

    return pdfBuffer;



    // const page = await browser.newPage();

    // // Set the HTML content to render the page
    // await page.setContent(html, { waitUntil: 'networkidle0' });


    // // Generate PDF
    // const pdfBuffer = await page.pdf({
    //     format: 'A4',
    //     displayHeaderFooter: true,  // Enable header and footer
    //     headerTemplate: `
    //     <div class="pdf-header">

    //     </div>
    //     <style>
    //     /* General table styles */
    //         .pdf-header { 
    //             font-size: 12px; 
    //             text-align: center; 
    //             padding: 10px; 
    //         }
    //         /* Hide header on page 1 */
    //         .pdf-header[page="1"] { display: none; }  
    //     </style>`,
    //     footerTemplate: `
    //         <div style="width: 100%; font-size: 12px; text-align: center; padding: 10px;">
    //             <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
    //         </div>`,
    //     margin: { top: '60px', bottom: '40px' }, // Adjust margins to fit header/footer
    // });

    // await browser.close();

    // return pdfBuffer;
}