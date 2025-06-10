import { Pipe, PipeTransform } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormArrayType } from "./dialogs/form-dialog";

@Pipe({
    standalone: true,
    name: 'savings',
    pure: false
})
export class SavingsPipe implements PipeTransform {
    transform<T extends 'oneTimePayment' | 'contribution'>(items: FormGroup<FormArrayType>[], key: T) {
        const r = items?.map(item => {
            if (['inventory', 'acquisition'].includes(item.controls.suggestion.value?.value!)) {
                return 0;
            }

            const suffix = item.controls.suggestion.value?.value === 'terminated' ? 1 : -1;
            let value = suffix * (item.controls[key].value ?? 0);
            if (!item.controls.monthly.value) {
                value = (value / 12);
            }

            return value;
        }).reduce((p, c) => p + c, 0) ?? 0;

        return r.toFixed(2)
    }

}
