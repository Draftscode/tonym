import { Pipe, PipeTransform } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormArrayType } from "./dialogs/form-dialog";

@Pipe({
    standalone: true,
    name: 'monthly',
    pure: false
})
export class MonthlyPipe implements PipeTransform {
    transform(item: FormGroup<FormArrayType>) {
        const value = item.controls.contribution.value ?? 0;
        if (item.controls.monthly.value) {
            return value.toFixed(2);
        }
        return (value / 12).toFixed(2)
    }

}
