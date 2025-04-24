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

export type Content = {
    firstname: string;
    lastname: string;
    items: TableRow[],
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


`

    let html = `<style>${styles}</style>`;
    let rows = ``;
    let totalOnce = 0;
    let totalContrib = 0;
    let _switch = 1;


    content.items.forEach((row) => {
        let cells = ``;

        cells += `<td>
        <span class="cell-header">Produkt</span>
        <div>${row['type'] ?? '-'}</div></td>`;
        cells += `<td>
             <span class="cell-header">Ves.Nr.</span>
             <div>${row['nr'] ?? '-'}</div></td>`;
        cells += `<td>
             <span class="cell-header">Versicherer</span>
             <div>${row['insurer'] ?? '-'}</div></td>`;
        cells += `<td>
             <span class="cell-header">VN</span>
             <div>${row['party'] ?? '-'}</div></td>`;
        cells += `<td>
                  <span class="cell-header">Vorschlag</span>
                  <div>${row['suggestion'] ?? '-'}</div></td>`;
        rows += `<tr class="${_switch === 1 ? 'odd' : 'even'}">${cells}</tr>`

        let lowerCells = ``;
        lowerCells += `<td colspan="2">
                  <span class="cell-header">Leistung</span>
                  <div>${row['scope'] ?? '-'}</div></td>`;
        lowerCells += `<td>
        <div class="cell">
             <span class="cell-header">Laufzeit</span>
             <div>${row['fromTo'] ?? '-'}</div></div></td>`;
        lowerCells += `<td>
             <span class="cell-header">Einmalig</span>
             <div>${row['oneTimePayment'] ?? '-'}€</div></td>`;
        lowerCells += `<td>
             <span class="cell-header">Beitrag</span>
             <div>${row['contribution'] ?? '-'}€</div></td>`;
        rows += `<tr class="${_switch === 1 ? 'odd' : 'even'} border-row">${lowerCells}</tr>`

        totalOnce += Number.parseFloat(`${row['oneTimePayment']}`);

        totalContrib += Number.parseFloat(`${row['contribution']}`);
        _switch *= -1;
    });


    html += `
<div style="padding: 4px">${content.firstname} ${content.lastname}</div>
<div style="padding: 4px">${content.street ?? ''} ${content.streetNo?? ''}</div>
<div style="padding: 4px">${content.zipCode?? ''}</div>
<div style="padding: 4px">${content.city?? ''}</div>
<div class="wrapper">
<table cellspacing="0" cellpadding="0">
<thead>
    <tr>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
        <th></th>
    </tr>
</thead>
<tbody>
    ${rows}
<tbody>
<tfoot>
<tr>
    <td colspan="3"></td>
    <td><b>${totalOnce} €</b></td>  
    <td><b>${totalContrib} €</b></td>
</tr>
</tfoot>
</table>
</div>
`;

    return html;
}