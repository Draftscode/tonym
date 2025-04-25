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
        const start = new Date(value[0]);
        const end = new Date(value[1]);

        const r = `${super.transform(start, format ?? 'dd.MM.YYYY')} - ${super.transform(end, format ?? 'dd.MM.YYYY')}`;
        return r;
    }
}