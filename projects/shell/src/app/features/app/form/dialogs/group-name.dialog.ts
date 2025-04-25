import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DividerModule } from "primeng/divider";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { InputTextModule } from "primeng/inputtext";

@Component({
    standalone: true,
    selector: 'group-name-dialog',
    templateUrl: 'group-name.dialog.html',
    imports: [ReactiveFormsModule, InputTextModule, DividerModule, ButtonModule]
})
export class GroupNameDialogComponent {
    private readonly pDialogConfig = inject(DynamicDialogConfig);
    private readonly pDialogRef = inject(DynamicDialogRef);
    protected readonly formGroup = new FormGroup({
        name: new FormControl<string | null>(null)
    });

    constructor() {
        this.formGroup.patchValue(this.pDialogConfig.data);
    }

    protected onClose() {
        this.pDialogRef.close({
            type: 'manually',
            data: this.formGroup.getRawValue(),
        });
    }
}