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
    firstname: string;
    lastname: string;
    items: TableRow[],
}


// Function to render a webpage using Puppeteer
export async function renderPageWithPuppeteer(content: Content): Promise<Uint8Array<ArrayBufferLike>> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const styles = `
            table {
                width: 100%;
                border-collapse: collapse; /* Ensures borders are combined */
                margin: 20px 0;
                border-radius: 4px;
                font-family: Arial, sans-serif;
                font-size: 12px;
                color: #333;
            }

            th, td {
                padding: 8px 12px; /* Adds padding to make the content more readable */
                text-align: left; /* Aligns text to the left */
                border: 1px solid #ddd; /* Adds light gray border to cells */
            }

            th {
                background-color: #4CAF50; /* Green background for header */
                color: white; /* White text color for headers */
                font-weight: bold;
            }

            tr:nth-child(even) {
                background-color: #f2f2f2; /* Light gray for even rows */
            }

            tr:nth-child(odd) {
                background-color: #ffffff; /* White for odd rows */
            }

            caption {
                font-size: 16px; /* Increases font size for the table caption */
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }

            /* Optional: Responsive styles for smaller screens */
            @media screen and (max-width: 600px) {
                table {
                    font-size: 10px;
                }
                th, td {
                    padding: 6px 8px;
                }
            }

            /* Optional: Borders between table header and body */
            thead {
                border-bottom: 2px solid #4CAF50; /* Adds a thicker green border under the header */
            }
`

    let html = `<style>${styles}</style>`;
    let rows = ``;
    let totalOnce = 0;
    let totalContrib = 0;

    content.items.forEach((row) => {
        let cells = ``;

        Object.keys(row ?? {}).forEach(key => {
            const typedKey = key as keyof typeof row;
            let withPrefix = null;
            if (typedKey === 'oneTimePayment') {
                totalOnce += Number.parseFloat(`${row[typedKey]}`);
                withPrefix = '€';
            }

            if (typedKey === 'contribution') {
                totalContrib += Number.parseFloat(`${row[typedKey]}`);
                withPrefix = '€';
            }

            cells += `<td>${row[typedKey]}${withPrefix ? ` ${withPrefix}` : ''}</td>`
        })

        rows += `<tr>${cells}</tr>`
    });


    html += `
    <div style="padding: 4px">${content.firstname} ${content.lastname}</div>
    <table>
        <thead>
            <tr>
                <th style="width: 15%">Baustein</th>
                <th style="width: 15%">Versicherer</th>
                <th style="width: 35%">Leistungsumfang</th>
                <th style="width: 11%">Vorschlag</th>
                <th style="width: 12%">Einmalig</th>
                <th style="width: 12%">Beitrag</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        <tbody>
        <tfoot>
        <tr>
            <td colspan="4"></td>
                <td><b>${totalOnce} €</b></td>
                <td><b>${totalContrib} €</b></td>
            </tr>
        </tfoot>
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
        margin: { top: '60px', bottom: '40px' }, // Adjust margins to fit header/footer
    });

    await browser.close();

    return pdfBuffer;
}