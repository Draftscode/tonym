import { Component, inject, signal } from "@angular/core";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AutoCompleteModule } from "primeng/autocomplete";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { DatePickerModule } from "primeng/datepicker";
import { DividerModule } from "primeng/divider";
import { DropdownModule } from "primeng/dropdown";
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { InputNumber } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { TooltipModule } from "primeng/tooltip";
import { GdvMember, GdvService } from "../../../../data-access/gdv.service";

export type SuggestionType = 'inventory' | 'terminated' | 'new' | 'acquisition';

export type Suggestion = {
    value: SuggestionType;
    label: string;
}

export type FormArrayType = {
    nr: FormControl<string | null>;
    party: FormControl<string | null>;//VN
    fromTo: FormControl<string | null>;
    insurer: FormControl<GdvMember | null>;
    scope: FormControl<string | null>;
    suggestion: FormControl<Suggestion | null>;
    oneTimePayment: FormControl<number | null>;
    contribution: FormControl<number | null>;
    type: FormControl<string | null>;
    monthly: FormControl<boolean | null>;
}

export type FormType = {
    zipCode: FormControl<string | null>;
    streetNo: FormControl<string | null>;
    street: FormControl<string | null>;
    city: FormControl<string | null>;
    firstname: FormControl<string | null>;
    lastname: FormControl<string | null>;
    items: FormArray<FormGroup<FormArrayType>>;
}

@Component({
    standalone: true,
    selector: 'form-dialog',
    templateUrl: 'form-dialog.html',
    imports: [ReactiveFormsModule, CheckboxModule, ButtonModule, InputNumber, AutoCompleteModule, TooltipModule,
        DividerModule, InputTextModule, DropdownModule, DatePickerModule, TranslateModule]
})
export class FormDialogComponent {
    private readonly pDialogRef = inject<DynamicDialogRef<FormDialogComponent>>(DynamicDialogRef);
    private readonly pDialogConfig = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);
    private readonly gdvService = inject(GdvService);
    private readonly ngxTranslate = inject(TranslateService);

    constructor() {
        const data = this.pDialogConfig.data;

        if (data) {
            let fromTo: any = '';
            if (typeof data.fromTo === 'string' && data.fromTo?.startsWith(' -')) {
                fromTo = data.fromTo.replace(' - ', '');
            } else if (Array.isArray(data.fromTo)) {
                fromTo = data.fromTo.map((d: string) => new Date(d));
            }

            this._formGroup = new FormGroup<FormArrayType>({
                nr: new FormControl<string | null>(data.nr),
                fromTo: new FormControl<string | null>(fromTo),
                party: new FormControl<string | null>(data.party),
                type: new FormControl<string | null>(data.type),
                insurer: new FormControl<GdvMember | null>(data.insurer),
                scope: new FormControl<string | null>(data.scope),
                suggestion: new FormControl<Suggestion | null>(data.suggestion),
                oneTimePayment: new FormControl<number>(data.oneTimePayment),
                contribution: new FormControl<number>(data.contribution),
                monthly: new FormControl<boolean>(data.monthly),
            });
        }
    }

    protected readonly _formGroup = new FormGroup<FormArrayType>({
        nr: new FormControl<string | null>(null),
        fromTo: new FormControl<string | null>(null),
        party: new FormControl<string | null>(null),
        type: new FormControl<string | null>(null),
        insurer: new FormControl<GdvMember | null>(null),
        scope: new FormControl<string | null>(null),
        suggestion: new FormControl<Suggestion | null>({ value: 'new', label: this.ngxTranslate.instant('label.new') }),
        oneTimePayment: new FormControl<number>(0),
        contribution: new FormControl<number>(0),
        monthly: new FormControl<boolean>(true),
    });

    protected insurers = signal<GdvMember[]>([]);

    protected close() {
        if (this._formGroup.invalid) { return; }

        const values = this._formGroup.getRawValue();

        this.pDialogRef.close({
            type: 'manually',
            data: values,
        })
    }

    protected async searchInsurers(query: string) {
        const insurers = await this.gdvService.getGdvMembers(query);
        const customInsurer = {
            name: `${query}`,
            image: '',
        }
        this.insurers.set([customInsurer, ...insurers]);
    }

    protected _suggs: Suggestion[] = [];

    protected onSearch(query: string) {
        this._suggs = [
            { value: 'new', label: this.ngxTranslate.instant('label.new') },
            { value: 'terminated', label: this.ngxTranslate.instant('label.terminated') },
            { value: 'inventory', label: this.ngxTranslate.instant('label.inventory') },
            { value: 'acquisition', label: this.ngxTranslate.instant('label.acquisition') }
        ];
    }
}