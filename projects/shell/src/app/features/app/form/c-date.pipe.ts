import { DatePipe } from "@angular/common";
import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'cDate',
    standalone: true,
})
export class CDatePipe extends DatePipe implements PipeTransform {

    override transform(value: any, format?: string, timezone?: string, locale?: string): any {
        // const formattedDate = super.transform(value, format, timezone, locale);
        // do other formatting and return the value
        if (!value) { return ''; }
        let result = '';
        try {
            if (value.length >= 1 && value[0]) {
                const start = new Date(value[0]);
                result += `${super.transform(start, format ?? 'dd.MM.yy')}`;
            }
        } catch (e) {
            console.error(e);
        }

        try {
            if (value.length === 2 && value[1]) {
                const end = new Date(value[1]);
                result += `${result ? ' - ' : ''}${super.transform(end, format ?? 'dd.MM.yy')}`
            }
        } catch (e) {
            console.error(e);
        }

        return result;
    }
}