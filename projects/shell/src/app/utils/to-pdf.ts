type SuggestionType = 'new' | 'discontinuation' | 'acquisition';

type TableRow = {
    type: string;
    insurer: string;
    scope: string;
    suggestion: SuggestionType;
    oneTimePayment: number;
    contribution: number;
    party: string;
    nr: string;
    fromTo: string;
}

type Group = {
    items: TableRow[];
    name: string;
}

export type Content = {
    firstname: string;
    lastname: string;
    groups: Group[],
    street: string;
    city: string;
    streetNo: string;
    zipCode: string;
}

export function toPdf(content: Content) {

    const styles = `
    .wrapper {
    overflow: hidden;
    border-radius: 8px;
    }
    table {
        width: 100%;
        margin: 20px 0;
        border-radius: 4px;
        font-family: Arial, sans-serif;
        font-size: 12px;
        border: 1px solid rgb(220,220,220);
        border-radius: 4px;
        overflow: hidden;
}
        tr.even {
        background-color: rgb(240,240,240);
        }

        tr.odd {
        background-color: transparent;
        }

        tr th {
            padding: 6px;
            text-align: left;
            background-color:rgb(127, 187, 255)
        }

        tr td {
        padding: 6px;
        vertical-align: top;
        }

        tr.border-row td {
            border-bottom: 1px solid rgb(220,220,220);
        }

        span.cell-header {
            font-weight: 600;
            padding-bottom: 4px;
        }

        .signature {
        margin-top: 80px;
        }

        .signature-field {
        margin-top: 40px;
        }

`

    let html = `<style>${styles}</style>`;
    let tables = ``;

    content.groups.forEach((group) => {
        let rows = ``;
        let _switch = 1;
        let totalOnce = 0;
        let totalContrib = 0;
        group.items.forEach((row) => {
            let cells = ``;

            cells += `<td>
        <div>${row['type'] ?? '-'}</div></td>`;
            cells += `<td>
             <div>${row['nr'] ?? '-'}</div></td>`;
            cells += `<td>
             <div>${row['insurer'] ?? '-'}</div></td>`;
            cells += `<td>
             <div>${row['party'] ?? '-'}</div></td>`;
            cells += `<td>
                  <span class="cell-header">Vorschlag</span>
                  <div>${row['suggestion'] ?? '-'}</div></td>`;


            cells += `<td>
                  <div>${row['scope'] ?? '-'}</div></td>`;
            cells += `<td>
        <div class="cell">
             <div>${row['fromTo'] ?? '-'}</div></div></td>`;
            cells += `<td>
             <div>${row['oneTimePayment'] ?? '-'}€</div></td>`;
            cells += `<td>
             <div>${row['contribution'] ?? '-'}€</div></td>`;
            // rows += `<tr class="${_switch === 1 ? 'odd' : 'even'} border-row">${lowerCells}</tr>`
            rows += `<tr class="${_switch === 1 ? 'odd' : 'even'}">${cells}</tr>`
            totalOnce += Number.parseFloat(`${row['oneTimePayment']}`);

            totalContrib += Number.parseFloat(`${row['contribution']}`);
            _switch *= -1;
        });

        const table = `
        <h2>${group.name}</h2>
        <table cellspacing="0" cellpadding="0">
        <thead>
            <tr>
                <th>Produkt</th>
                <th>Vers.Nr.</th>
                <th>Versicherer</th>
                <th>VN</th>
                <th>Vorschlag</th>
                <th>Leistung</th>
                <th>Laufzeit</th>
                <th>Einmalig</th>
                <th>Beitrag</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
        <tbody>
        <tfoot>
        <tr>
            <td colspan="7"></td>
            <td><b>${totalOnce} €</b></td>  
            <td><b>${totalContrib} €</b></td>
        </tr>
        </tfoot>
        </table>
        </div>`;

        tables += table
    })

    html += `
<div style="padding: 4px">${content.firstname} ${content.lastname}</div>
<div style="padding: 4px">${content.street ?? ''} ${content.streetNo ?? ''}</div>
<div style="padding: 4px">${content.zipCode ?? ''}</div>
<div style="padding: 4px">${content.city ?? ''}</div>
<div class="wrapper">
${tables}
<div class="signature">
<div><b>Unterschift</b></div>
<div class="signature-field">_______________________________</div>
<div>${content.firstname} ${content.lastname}</div>
</div>
`;

    return html;
}