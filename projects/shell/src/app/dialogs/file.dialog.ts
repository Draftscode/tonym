import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
    selector: 'file-dialog',
    templateUrl: 'file.dialog.html',
    imports: [ReactiveFormsModule, KeyFilterModule, InputTextModule, ButtonModule, DividerModule]
})
export class FileDialogComponent {
    protected readonly blockChars: RegExp = /^(?!.* {2})[A-Za-z0-9\-, ]*$/;
    private readonly pDialogRef = inject<DynamicDialogRef<FileDialogComponent>>(DynamicDialogRef);
    private readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);

    protected readonly formGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
    });

    constructor() {
        this.formGroup.controls.name.patchValue(this.pDialogConf.data?.name);
    }

    protected onClose() {
        if (this.formGroup.invalid) { return; }

        this.pDialogRef.close({
            type: 'manually',
            data: this.formGroup.getRawValue(),
        })
    }
}