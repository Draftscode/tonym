import { Pipe, PipeTransform } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormArrayType } from "./dialogs/form-dialog";

@Pipe({
    standalone: true,
    name: 'newContribution',
    pure: false
})
export class NewPipe implements PipeTransform {
    transform<T extends 'oneTimePayment' | 'contribution'>(items: FormGroup<FormArrayType>[], key: T) {
        const r = items?.map(item => {
            if (item.controls.suggestion.value?.value === 'terminated') { return 0 };

            let value =  (item.controls[key].value ?? 0);
            if(!item.controls.monthly.value) {
                value = (value / 12);
            }

            return value;
        }).reduce((p, c) => p + c, 0) ?? 0;

        return r.toFixed(2)
    }

}
