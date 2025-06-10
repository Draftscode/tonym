import { GdvMember } from "../data-access/gdv.service";
import { Suggestion } from "../features/app/form/dialogs/form-dialog";


export type TableRow = {
    type: string;
    insurer: GdvMember;
    scope: string;
    suggestion: Suggestion;
    oneTimePayment: number;
    contribution: number;
    party: string;
    nr: string;
    fromTo: string;
    monthly: boolean;
}

export type Group = {
    items: TableRow[];
    name: string;
}

type Person = {
    firstname: string;
    lastname: string;
    street: string;
    company: string;
    city: string;
    streetNo: string;
    zipCode: string;
};

export type Content = {
    persons: Person[],
    groups: Group[],
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

        tr.border-top td {
        border-top: 1px solid rgb(51, 51, 51);
        }

`

    let html = `<style>${styles}</style>`;
    let tables = ``;

    content.groups.forEach((group) => {
        let rows = ``;
        let _switch = 1;
        let totalOnce = 0;
        let existed = 0;
        let savings = 0;
        let current = 0;


        group.items.forEach((row) => {
            let cells = ``;
            const suffix = row['suggestion']?.value === 'terminated' ? -1 : 1;
            let contrib = Number.parseFloat(`${row['contribution']}`);
            if (!row['monthly']) {
                contrib = (contrib / 12);
            }

            cells += `<td>
            <div>${row['type'] ?? '-'}</div></td>`;
            cells += `<td>
            <div>${row['nr'] ?? '-'}</div></td>`;
            cells += `<td>
            <div style="display: flex; align-items: center; gap: .25rem">${row['insurer'] ? `<img style="height: 32px; width: auto" src="${row['insurer'].image}" /><span>${row['insurer'].name}</span>` : '-'}</div></td>`;
            cells += `<td>
            <div>${row['party'] ?? '-'}</div></td>`;
            cells += `<td>
            <div>${row['suggestion'].label ?? '-'}</div></td>`;


            cells += `<td>
            <div>${row['scope'] ?? '-'}</div></td>`;
            cells += `<td>
            <div class="cell">
            <div>${row['fromTo'] ?? '-'}</div></div></td>`;
            cells += `<td>
            <div>${row['oneTimePayment'] ?? '-'}€</div></td>`;
            cells += `<td>
            <div>${contrib.toFixed(2) ?? '-'}€</div></td>`;
            // rows += `<tr class="${_switch === 1 ? 'odd' : 'even'} border-row">${lowerCells}</tr>`
            rows += `<tr class="${_switch === 1 ? 'odd' : 'even'}">${cells}</tr>`;



            if (row['suggestion']?.value === 'terminated') {
                savings += contrib;
                existed += contrib;
            }

            if (row['suggestion']?.value === 'inventory') {
                existed += contrib;
                current += contrib;
            }

            if (row['suggestion']?.value === 'new') {
                totalOnce += suffix * Number.parseFloat(`${row['oneTimePayment']}`);
                savings -= contrib;
                current += contrib;
            }

            if (row['suggestion']?.value === 'acquisition') {
                current += contrib;
                 existed += contrib;
            }

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
            <tr class="border-top">
                <td colspan="7">Alt (monatl.)</td>
                <td><b></b></td>  
                <td><b>${existed.toFixed(2)} €</b></td>
            </tr>
            <tr>
                <td colspan="7">Neu (monatl.)</td>
                <td><b>${totalOnce.toFixed(2)} €</b></td>  
                <td><b>${current.toFixed(2)} €</b></td>
            </tr>
            <tr>
                <td colspan="7">Ersparnis (monatl.)</td>
                <td><b></b></td>  
                <td><b>${savings.toFixed(2)} €</b></td>
            </tr>
        <tbody>
        </table>
        </div>`;

        tables += table
    })

    let personHtml = ``;
    let signature = ``;
    content.persons.forEach(person => {
        personHtml += `
        <div class="p">
        ${person.company ? `<div style="padding: 4px">${person.company}</div>` : ''}
    <div style="padding: 4px">${person.firstname} ${person.lastname}</div>
    <div style="padding: 4px">${person.street ?? ''} ${person.streetNo ?? ''}</div>
    <div style="padding: 4px">${person.zipCode ?? ''}</div>
    <div style="padding: 4px">${person.city ?? ''}</div>
  </div>`;

        signature += `<div class="p"><div><b>Unterschift</b></div>
<div class="signature-field">_______________________________</div>
<div>${person.firstname} ${person.lastname}</div></div>`;
    })

    html += `
    <div style="display: flex; gap: 12px;">
${personHtml}
</div>
<div class="wrapper">
${tables}
<div class="signature" style="display: flex; gap:4px; w-full; justify-content: space-between">
${signature}
</div>
`;

    return html;
}