import { Pipe, PipeTransform } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormArrayType } from "./dialogs/form-dialog";

@Pipe({
    standalone: true,
    name: 'totalOnce',
    pure: false
})
export class TotalPipe implements PipeTransform {
    transform<T extends 'oneTimePayment' | 'contribution'>(items: FormGroup<FormArrayType>[], key: T) {
        const r = items?.map(item => {
            return (item.controls[key].value ?? 0);
        }).reduce((p, c) => p + c, 0) ?? 0;

        return r.toFixed(2)
    }

}
