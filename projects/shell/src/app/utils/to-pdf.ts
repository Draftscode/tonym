import { GdvMember } from "../data-access/gdv.service";

type SuggestionType = 'new' | 'discontinuation' | 'acquisition';

export type TableRow = {
    type: string;
    insurer: GdvMember;
    scope: string;
    suggestion: SuggestionType;
    oneTimePayment: number;
    contribution: number;
    party: string;
    nr: string;
    fromTo: string;
}

export type Group = {
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

//     thead {
//       display: table-header-group;
//       }

//       @media print {
//   thead {
//     display: table-row-group !important; /* This disables repetition */
//   }
}
        tr {
            break-inside: avoid;
            page-break-inside: avoid; /* fallback for older Chromium */
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
            color: white;
            background-color:rgb(25, 66, 109)
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
            <div style="display: flex; align-items: center; gap: .25rem">${row['insurer'] ? `<img style="height: 32px; width: auto" src="${row['insurer'].image}" /><span>${row['insurer'].name}</span>` : '-'}</div></td>`;
            cells += `<td>
            <div>${row['party'] ?? '-'}</div></td>`;
            cells += `<td>
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
                <th style="width: 10%">Produkt</th>
                <th style="width: 10%">Vers.Nr.</th>
                <th style="width: 16%">Versicherer</th>
                <th style="width: 10%">VN</th>
                <th style="width: 10%">Vorschlag</th>
                <th style="width: 20%">Leistung</th>
                <th style="width: 10%">Laufzeit</th>
                <th style="width: 7%">Einmalig</th>
                <th style="width: 7%">Beitrag</th>
            </tr>
        </thead>
        <tbody>
            ${rows}
                    <tr>
            <td colspan="7"></td>
            <td><b>${totalOnce.toFixed(2)} €</b></td>  
            <td><b>${totalContrib.toFixed(2)} €</b></td>
        </tr>
        <tbody>
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