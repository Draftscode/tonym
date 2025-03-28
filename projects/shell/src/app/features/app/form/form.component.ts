import { Component, computed, effect, inject, signal } from "@angular/core";
import { takeUntilDestroyed, toSignal } from "@angular/core/rxjs-interop";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from "primeng/button";
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { lastValueFrom } from "rxjs";
import { PdfService } from "../../../data-access/pdf.service";

type SuggestionType = 'new' | 'discontinuation' | 'acquisition';

type Header = {
    label: string;
    width?: number;
    prefix?: string;
    editor?: string;
};

@Component({
    host: { class: 'w-full h-full' },
    selector: 'app-form',
    imports: [AutoCompleteModule, TranslateModule,
        InputTextModule, TableModule, ProgressBarModule,
        TextareaModule, ReactiveFormsModule, CardModule,
        AutoCompleteModule, ButtonModule, DividerModule,
    ],
    templateUrl: 'form.component.html'
})
export class FormComponent {
    protected readonly _suggestions = signal<string[]>([]);
    protected readonly _pdfService = inject(PdfService);
    protected _suggs: SuggestionType[] = ['new', 'discontinuation', 'acquisition'];

    protected readonly _headers = signal<Header[]>([
        { label: 'type' },
        { label: 'insurer' },
        { label: 'scope', width: 35 },
        { label: 'suggestion', editor: 'dropdown' },
        { label: 'oneTimePayment', prefix: '€' },
        { label: 'contribution', prefix: '€' }
    ]);

    protected _search(query: string) {
        this._suggs = ['new', 'discontinuation', 'acquisition'];
    }

    protected readonly _formGroup = new FormGroup({
        tenant: new FormControl<string | null>(null, []),
        firstname: new FormControl<string | null>(null, [Validators.required]),
        lastname: new FormControl<string | null>(null, [Validators.required]),
        items: new FormArray([
            new FormGroup({
                type: new FormControl('Krankentagegeld'),
                insurer: new FormControl('Bayrische Beamten KK'),
                scope: new FormControl(`Krankentagegeld 450 € pro Monat - ab 43. Tag - inkl. Kündigungsverzicht des Versicherers`),
                suggestion: new FormControl<SuggestionType>('new'),
                oneTimePayment: new FormControl<number>(12.23),
                contribution: new FormControl<number>(160),
            }),
            new FormGroup({
                type: new FormControl('Unfallversicherung'),
                insurer: new FormControl('Debeka'),
                scope: new FormControl(`VS: 120.000 € / 270.000 € / Progr. 225 % - Todesfall: 19.000 € - Bergung, kosmetische OPs, Kurbeihilfe, Zahnersatz - MWA 40% - Stand 2017`),
                suggestion: new FormControl<SuggestionType>('discontinuation'),
                oneTimePayment: new FormControl<number>(0),
                contribution: new FormControl<number>(-14.24),
            }),
        ])
    });

    private readonly _formChange = toSignal(this._formGroup.valueChanges.pipe(takeUntilDestroyed()));

    protected readonly _totalOnce = computed(() => {
        this._formChange();
        const value = this._formGroup.controls.items.controls
            .map(ctrl => ctrl.controls.oneTimePayment.value ?? 0)
            .reduce((p, c) => p + c, 0);

        return value;
    });

    protected readonly _totalContrib = computed(() => {
        this._formChange();
        const value = this._formGroup.controls.items.controls
            .map(ctrl => ctrl.controls.contribution.value ?? 0)
            .reduce((p, c) => p + c, 0);

        return value;
    });

    constructor() {
        effect(() => {
            const isLoading = this._pdfService.isLoading();
            if (isLoading) {
                this._formGroup.disable();
            } else {
                this._formGroup.enable();
            }
        });

    }

    protected _onComplete(query: string) {
        this._suggestions.set(['Hallo', 'Ballo'])
    }


    protected async _onCreatePdf() {
        if (this._formGroup.invalid) { return; }

        const form = this._formGroup.getRawValue();
        lastValueFrom(this._pdfService.createPdf(form));
    }

    protected _onRemoveRow(index: number) {
        this._formGroup.controls.items.removeAt(index);
    }

    protected _onAddRow() {
        this._formGroup.controls.items.push(new FormGroup({
            type: new FormControl<string | null>(null),
            insurer: new FormControl<string | null>(null),
            scope: new FormControl<string | null>(null),
            suggestion: new FormControl<SuggestionType | null>(null),
            oneTimePayment: new FormControl<number>(0),
            contribution: new FormControl<number>(0),
        }));
    }

}