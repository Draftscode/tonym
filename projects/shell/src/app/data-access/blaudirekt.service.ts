import { effect, inject, Injectable, resource, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { debounceTime, lastValueFrom, Subject } from "rxjs";
import { ElectronService } from "./electron.service";

export type Contract = {

};

export type BlaudirectPerson = {
    Vorname: string;
    Nachname: string;
    Firma: string;
}

export type BlaudirektCustomer = {
    Person: BlaudirectPerson;
    Id: string;
    Hauptwohnsitz: {
        Land: string;
        Ort: string;
        Postleitzahl: string;
        Strasse: string;
    }
}

export enum PaymentCycle {
    monthly = '5',
    yearly = '1',
}

export type BlaudirectContract = {
    Id: number;
    Laufzeit: {
        Ablauf: string;
        Beginn: string;
    },
    Sparte: string;
    Gesellschaft: string;
    Versicherungsscheinnummer: string;
    Beitrag: {
        Brutto: number;
        Netto: number;
        Steuer: number;
        Zahlweise: PaymentCycle;
    }
}

export type BlaudirektCompany = {
    Logos: {
        Breite: number | null;
        Höhe: number | null;
        Pfad: string;
    }[],
    Text: string;
    Value: string;
    VertragsanlageMoeglich: boolean;
}

export type BlaudirektDivision = {
    Text: string;
    Value: string;
}

@Injectable({ providedIn: 'root' })
export class BlaudirektService {
    private readonly electronService = inject(ElectronService);

    private readonly search$ = new Subject<string>();
    private readonly query = toSignal(this.search$.pipe(debounceTime(500)));
    readonly companies = signal<BlaudirektCompany[]>([]);
    readonly divisions = signal<BlaudirektDivision[]>([]);

    search(query: string) {
        this.search$.next(query);
    }

    private readonly _customers = resource({

        params: () => {
            return { query: this.query() }
        },
        loader: ({ params }) => this.searchCustomers(params.query),
        defaultValue: [],

    });

    async searchCustomers(query?: string) {
        if (!query?.length) { return []; }
        return lastValueFrom(this.electronService.handle<BlaudirektCustomer[]>('api/blaudirekt/clients', { query }));
    }

    async searchContracts(customerId?: string) {
        if (!customerId) { return []; }

        return lastValueFrom(this.electronService.handle<BlaudirectContract[]>('api/blaudirekt/contracts', { customerId }));
    }


    async searchCompanies() {
        const companies = await lastValueFrom(this.electronService.handle<BlaudirektCompany[]>('api/blaudirekt/companies', {}));
        this.companies.set(companies);
    }


    async searchDivisions() {
        const divisions = await lastValueFrom(this.electronService.handle<BlaudirektDivision[]>('api/blaudirekt/divisions', {}));
        this.divisions.set(divisions);
    }

    get customers() {
        return this._customers;
    }

    async init() {
        return Promise.all([
            this.searchCompanies(),
            this.searchDivisions(),
        ]);
    }
}