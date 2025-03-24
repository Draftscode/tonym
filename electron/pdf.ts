import puppeteer from 'puppeteer';

type SuggestionType = 'new' | 'discontinuation' | 'acquisition';

type TableRow = {
    type: string;
    insurer: string;
    scope: string;
    suggestion: SuggestionType;
    oneTimePayment: number;
    contribution: number;
}

type Content = {
    items: TableRow[],
}


// Function to render a webpage using Puppeteer
export async function renderPageWithPuppeteer(content: Content): Promise<Uint8Array<ArrayBufferLike>> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    let html = ``;
    let rows = ``;

    content.items.forEach((row) => {
        let cells = ``;

        Object.keys(row ?? {}).forEach(key => {
            const typedKey = key as keyof typeof row
            cells += `<td>${row[typedKey]}</td>`
        })

        rows += `<tr>${cells}</tr>`
    });


    html += `
    <table>
        <thead>
            <tr>
                <th>Leistung</th>
                <th>Versicherer</th>
                <th>Leistungsumfang</th>
                <th>Vorschlag</th>
                <th>Einmalig</th>
                <th>Beitrag</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        <tbody>
    </table>
    `

    // Set the HTML content to render the page
    await page.setContent(html, { waitUntil: 'networkidle0' });


    // Generate PDF
    const pdfBuffer = await page.pdf({
        format: 'A4',
        displayHeaderFooter: true,  // Enable header and footer
        headerTemplate: `
        <div class="pdf-header">
            <span>My Custom Header - Page <span class="pageNumber"></span></span>
        </div>
        <style>
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
        margin: { top: '60px', bottom: '40px' }, // Adjust margins to fit header/footer
    });

    await browser.close();

    return pdfBuffer;
}