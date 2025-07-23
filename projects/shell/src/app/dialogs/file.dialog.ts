import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { KeyFilterModule } from 'primeng/keyfilter';
import { RadioButtonModule } from "primeng/radiobutton";
import { BlaudirektCustomer, BlaudirektService } from "../data-access/blaudirekt.service";

@Component({
    selector: 'file-dialog',
    templateUrl: 'file.dialog.html',
    imports: [ReactiveFormsModule, KeyFilterModule, FormsModule, RadioButtonModule, InputTextModule, ButtonModule, DividerModule]
})
export class FileDialogComponent {
    protected readonly blockChars: RegExp = /^(?!.* {2})[A-Za-z0-9\-, ]*$/;
    private readonly pDialogRef = inject<DynamicDialogRef<FileDialogComponent>>(DynamicDialogRef);
    protected readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);

    protected readonly blaudirektService = inject(BlaudirektService);
    customer: any;
    protected readonly formGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
        cusomer: new FormControl(),
    });

    constructor() {
        this.formGroup.controls.name.patchValue(this.pDialogConf.data?.name);
    }

    protected search(query: string) {
        if (query.length > 2) {
            this.blaudirektService.query.set(query);
        }
    }

    protected onClose() {
        if (this.formGroup.invalid) { return; }

        this.pDialogRef.close({
            type: 'manually',
            data: this.formGroup.getRawValue(),
        })
    }

    optionLabelFn(item: BlaudirektCustomer) {
        return `${item.Person.Vorname} ${item.Person.Nachname}`;
    }
}