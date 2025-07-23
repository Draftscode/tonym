import { inject, Injectable, resource, signal } from "@angular/core";
import { lastValueFrom, tap } from "rxjs";
import { ElectronService } from "./electron.service";

export type Contract = {

};

export type BlaudirectPerson = {
    Vorname: string;
    Nachname: string;
}

export type BlaudirektCustomer = {
    Person: BlaudirectPerson;
    Id: string;
}

@Injectable({ providedIn: 'root' })
export class BlaudirektService {
    private readonly electronService = inject(ElectronService);

    query = signal<string>('a');

    private readonly _customers = resource({
        request: () => {
            return { query: this.query() }
        },
        loader: ({ request }) => this.searchCustomers(request.query),
        defaultValue: [],

    });

    searchCustomers(query: string) {
        return lastValueFrom(this.electronService.handle<BlaudirektCustomer[]>('api/blaudirekt/clients', { query }).pipe(tap(console.log)));
    }

    get customers() {
        return this._customers;
    }
}