import { Component, computed, inject, signal } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageModule } from "primeng/message";
import { BlaudirectContract, BlaudirektCustomer, BlaudirektService } from "../data-access/blaudirekt.service";
import { CompanyComponent } from "./company";
import { toSignal } from "@angular/core/rxjs-interop";

@Component({
    selector: 'file-dialog',
    templateUrl: 'file.dialog.html',
    imports: [ReactiveFormsModule, FormsModule, MessageModule, CheckboxModule, AutoCompleteModule, CompanyComponent,
        KeyFilterModule, InputTextModule, ButtonModule, DividerModule]
})
export class FileDialogComponent {
    protected readonly blockChars: RegExp = /^(?!.* {2})[A-Za-z0-9\-, ]*$/;
    private readonly pDialogRef = inject<DynamicDialogRef<FileDialogComponent>>(DynamicDialogRef);
    protected readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);

    protected readonly blaudirektService = inject(BlaudirektService);

    protected readonly formGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        customer: new FormControl<BlaudirektCustomer | null>(null),
        selectedContracts: new FormControl<BlaudirectContract[]>([]),
    });

    protected readonly contracts = signal<BlaudirectContract[]>([]);

    constructor() {
        this.formGroup.controls.name.patchValue(this.pDialogConf.data?.name, { emitEvent: false });
    }

    protected toggleSelection() {
        if (this.formGroup.controls.selectedContracts.value?.length === this.contracts()?.length) {
            this.formGroup.patchValue({ selectedContracts: [] });
        } else {
            this.formGroup.patchValue({ selectedContracts: this.contracts() });
        }
    }

    protected readonly formValues = toSignal(this.formGroup.valueChanges);

    protected isIndeterminate = computed(() => {
        const isIndeterminate = !!(this.formValues()?.selectedContracts?.length && (this.contracts().length !== (this.formValues()?.selectedContracts?.length ?? 0)));
        return isIndeterminate;
    });

    protected isChecked = computed(() => {
        const isChecked = !this.isIndeterminate() && !!(this.formValues()?.selectedContracts?.length === this.contracts().length);
        return isChecked;
    });

    protected search(query: string) {
        this.blaudirektService.search(query);
    }


    protected labelFn(item: BlaudirektCustomer): string {
        return `${item.Person.Vorname} ${item.Person.Nachname}`;
    }

    protected async searchContracts(customerId?: string) {
        this.contracts.set(await this.blaudirektService.searchContracts(customerId));
        this.toggleSelection();
    }

    protected async onClose() {
        if (this.formGroup.invalid) { return; }
        const raw = this.formGroup.getRawValue();


        let contents = {};
        if (raw.customer?.Id) {
            const items = raw.selectedContracts?.map(contract => {
                const fromTo = [
                    contract.Laufzeit?.Beginn ? new Date(contract.Laufzeit.Beginn).toISOString() : null,
                    contract.Laufzeit?.Beginn ? new Date(contract.Laufzeit.Ablauf).toISOString() : null,
                ];
                const company = this.blaudirektService.companies().find(comp => comp.Value === contract.Gesellschaft);
                const division = this.blaudirektService.divisions().find(div => div.Value === contract.Sparte);

                return {
                    contribution: contract.Beitrag.Brutto,
                    fromTo,
                    insurer: { image: company?.Logos[0].Pfad, name: company?.Text },
                    monthly: contract.Beitrag.Zahlweise === '1',
                    nr: contract.Versicherungsscheinnummer,
                    oneTimePayment: 0,
                    party: "",
                    scope: "",
                    suggestion: { value: 'acquisition', label: 'Übernahme' },
                    type: division?.Text
                };
            });

            contents = {
                persons: [{
                    firstname: raw.customer?.Person.Vorname,
                    lastname: raw.customer?.Person.Nachname,
                    street: raw.customer?.Hauptwohnsitz.Strasse,
                    city: raw.customer?.Hauptwohnsitz.Ort,
                    company: raw.customer?.Person.Firma,
                    zipCode: raw.customer?.Hauptwohnsitz.Postleitzahl
                }],
                groups: [{
                    name: 'Bestand',
                    items,
                }]
            }
        }

        this.pDialogRef.close({
            type: 'manually',
            data: { name: raw.name, contents },
        })
    }

    optionLabelFn(item: BlaudirektCustomer) {
        return `${item.Person.Vorname} ${item.Person.Nachname}`;
    }
}