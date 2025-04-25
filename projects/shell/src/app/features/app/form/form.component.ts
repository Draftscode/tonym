import { ChangeDetectorRef, Component, effect, inject, signal, untracked } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ButtonModule } from "primeng/button";
import { CardModule } from 'primeng/card';
import { DatePickerModule } from "primeng/datepicker";
import { DividerModule } from 'primeng/divider';
import { DialogService } from "primeng/dynamicdialog";
import { InputTextModule } from 'primeng/inputtext';
import { ProgressBarModule } from 'primeng/progressbar';
import { TableModule } from 'primeng/table';
import { TextareaModule } from 'primeng/textarea';
import { distinctUntilChanged, filter, lastValueFrom, map, take } from "rxjs";
import { FileService } from "../../../data-access/file.service";
import { PdfService } from "../../../data-access/pdf.service";
import { Content } from "../../../utils/to-pdf";
import { CDatePipe } from "./c-date.pipe";
import { FormDialogComponent } from "./dialogs/form-dialog";
import { TotalPipe } from "./total.pipe";
import { DialogModule } from "primeng/dialog";
import { GroupNameDialogComponent } from "./dialogs/group-name.dialog";

type Header = {
    label: string;
    width?: number;
    prefix?: string;
    editor?: string;
};

export type FormArrayType = {
    nr: FormControl<string | null>;
    party: FormControl<string | null>;//VN
    fromTo: FormControl<string | null>;
    insurer: FormControl<string | null>;
    scope: FormControl<string | null>;
    suggestion: FormControl<string | null>;
    oneTimePayment: FormControl<number | null>;
    contribution: FormControl<number | null>;
    type: FormControl<string | null>;
}

export type FormList = {
    items: FormArray<FormGroup<FormArrayType>>;
    name: FormControl<string | null>;
}

export type FormType = {
    zipCode: FormControl<string | null>;
    streetNo: FormControl<string | null>;
    street: FormControl<string | null>;
    city: FormControl<string | null>;
    firstname: FormControl<string | null>;
    lastname: FormControl<string | null>;
    groups: FormArray<FormGroup<FormList>>;
}

@Component({
    host: { class: 'w-full h-full' },
    selector: 'app-form',
    imports: [AutoCompleteModule, TranslateModule, DatePickerModule,
        InputTextModule, TableModule, ProgressBarModule, DialogModule,
        TextareaModule, ReactiveFormsModule, CardModule, TotalPipe,
        AutoCompleteModule, ButtonModule, DividerModule, CDatePipe
    ],
    providers: [CDatePipe],
    templateUrl: 'form.component.html'
})
export class FormComponent {
    private readonly pDialog = inject(DialogService);
    private readonly ngCdr = inject(ChangeDetectorRef);
    protected readonly _suggestions = signal<string[]>([]);
    protected readonly _pdfService = inject(PdfService);
    protected _suggs: string[] = ['Neu', 'Einstellung', 'Übernahme'];
    private readonly _ngActiveRoute = inject(ActivatedRoute);
    private readonly _filename = toSignal(this._ngActiveRoute.queryParams.pipe(map(q => q['filename']), filter(f => !!f), distinctUntilChanged()));
    // private readonly _electronService = inject(ElectronService);
    private readonly fileService = inject(FileService);

    protected readonly _formGroup = new FormGroup<FormType>({
        firstname: new FormControl<string | null>(null, [Validators.required]),
        lastname: new FormControl<string | null>(null, [Validators.required]),
        street: new FormControl<string | null>(null),
        zipCode: new FormControl<string | null>(null),
        city: new FormControl<string | null>(null),
        streetNo: new FormControl<string | null>(null),
        groups: new FormArray([
            new FormGroup({
                name: new FormControl('Gruppe 1'),
                items: new FormArray<FormGroup<FormArrayType>>([]),
            }),
        ]),
    });

    protected readonly _headers = signal<Header[]>([
        { label: 'type' },
        { label: 'nr' },
        { label: 'insurer' },
        { label: 'party' },
        { label: 'scope', width: 35 },
        { label: 'suggestion', editor: 'dropdown' },
        { label: 'fromTo', editor: 'range' },
        { label: 'oneTimePayment', prefix: '€' },
        { label: 'contribution', prefix: '€' },
    ]);

    protected _search(query: string) {
        this._suggs = ['Neu', 'Einstellung', 'Übernahme'];
    }

    protected onRemoveGroup(groupIndex: number) {
        this._formGroup.controls.groups.removeAt(groupIndex);
    }

    protected async onEditGroup(groupIndex: number) {
        const ref = this.pDialog.open(GroupNameDialogComponent, {
            closable: true,
            header: 'Guppe bearbeiten',
            data: {
                name:
                    this._formGroup.controls.groups.at(groupIndex).controls.name.value,
            }
        });

        const result = await lastValueFrom(ref.onClose.pipe(take(1)));

        if (result?.type === 'manually') {
            this._formGroup.controls.groups.at(groupIndex).patchValue({ name: result.data?.name ?? '' });
            this.ngCdr.markForCheck();
        }
    }

    protected onAddGroup() {
        const group = new FormGroup({
            name: new FormControl<string | null>('Neue Gruppe'),
            items: new FormArray<FormGroup<FormArrayType>>([]),
        });
        this._formGroup.controls.groups.insert(0, group);
    }

    constructor() {
        effect(() => {
            const isLoading = this._pdfService.isLoading();
            if (isLoading) {
                this._formGroup.disable();
            } else {
                this._formGroup.enable();
            }
        });

        effect(() => {
            const filename = this._filename();

            if (!filename) { return; }
            untracked(async () => {
                const content = await this.fileService.readFile<Content>(filename);
                this._formGroup.patchValue(content);
            });
        })

    }

    protected _onComplete(query: string) {
        this._suggestions.set(['Hallo', 'Ballo'])
    }


    private readonly cDatePipe = inject(CDatePipe);
    protected async _onCreatePdf() {
        if (this._formGroup.invalid) { return; }

        const form = this._formGroup.getRawValue() as Content;
        form.groups.forEach(group => {
            group.items.forEach(item => {
                item.contribution = parseFloat(`${item.contribution}`),
                    item.oneTimePayment = parseFloat(`${item.oneTimePayment}`),
                    item.fromTo = this.cDatePipe.transform(item.fromTo, 'dd.MM.YYYY');
            });
        });

        lastValueFrom(this._pdfService.createPdf(form));
    }

    protected _onRemoveRow(groupIndex: number, index: number) {
        this._formGroup.controls.groups.at(groupIndex).controls.items.removeAt(index);
    }

    protected async onEditRow(groupIndex: number, rowIndex: number) {
        const ref = this.pDialog.open(
            FormDialogComponent,
            {
                header: 'Zeile bearbeiten',
                data: this._formGroup.controls.groups.at(groupIndex).controls.items.value[rowIndex],
                closable: true,
            }
        );

        const result = await lastValueFrom(ref.onClose.pipe(take(1)));
        if (result?.type === 'manually') {
            const control = this._formGroup.controls.groups.at(groupIndex).controls.items.at(rowIndex);
            control.patchValue({
                nr: result.data.nr,
                fromTo: result.data.fromTo,
                party: result.data.party,
                type: result.data.type,
                insurer: result.data.insurer,
                scope: result.data.scope,
                suggestion: result.data.suggestion,
                oneTimePayment: result.data.oneTimePayment,
                contribution: result.data.contribution,
            });
            this.ngCdr.markForCheck();
        }
    }

    protected async _onAddRow(groupIndex: number) {
        const ref = this.pDialog.open(
            FormDialogComponent,
            {
                data: null,
                header: 'Zeile hinzufügen',
                closable: true,
            }
        );

        ref.onClose.pipe(take(1)).subscribe(result => {
            if (result?.type === 'manually') {

                const control = this._formGroup.controls.groups.at(groupIndex).controls.items;

                control.push(new FormGroup<FormArrayType>({
                    nr: new FormControl<string | null>(result.data.nr),
                    fromTo: new FormControl<string | null>(result.data.fromTo),
                    party: new FormControl<string | null>(result.data.party),
                    type: new FormControl<string | null>(result.data.type),
                    insurer: new FormControl<string | null>(result.data.insurer),
                    scope: new FormControl<string | null>(result.data.scope),
                    suggestion: new FormControl<string | null>(result.data.suggestion),
                    oneTimePayment: new FormControl<number>(result.data.oneTimePayment),
                    contribution: new FormControl<number>(result.data.contribution),
                }))
                this.ngCdr.markForCheck();
            }
        });


    }

}