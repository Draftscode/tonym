import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";

@Component({
    selector: 'file-dialog',
    templateUrl: 'file.dialog.html',
    imports: [ReactiveFormsModule, InputTextModule, ButtonModule, DividerModule]
})
export class FileDialogComponent {
    private readonly pDialogRef = inject<DynamicDialogRef<FileDialogComponent>>(DynamicDialogRef);
    private readonly pDialogConf = inject<DynamicDialogConfig<any>>(DynamicDialogConfig);

    protected readonly formGroup = new FormGroup({
        name: new FormControl<string>('', [Validators.required]),
    });

    protected onClose() {
        if (this.formGroup.invalid) { return; }

        this.pDialogRef.close({
            type: 'manually',
            data: this.formGroup.getRawValue(),
        })
    }
}