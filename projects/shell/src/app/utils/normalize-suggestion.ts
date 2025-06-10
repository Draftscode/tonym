import { TranslateService } from "@ngx-translate/core";
import { Suggestion, SuggestionType } from "../features/app/form/dialogs/form-dialog";

export function normalizeSuggestion(sugg: Suggestion | string | null, ngxTranslate: TranslateService): Suggestion | null {
    let value: SuggestionType | null = null;
    if (typeof sugg === 'string') {
        if (sugg === 'wird gekündigt') {
            value = 'terminated';
        } else if (sugg === 'Neu') {
            value = 'new';
        } else if (sugg === 'Bestand') {
            value = 'inventory';
        } else if (sugg === 'Übernahme') {
            value = 'acquisition';
        } else {
            value = sugg as SuggestionType;
        }

    } else {
        value = sugg?.value ?? null;
    }

    if (value) {
        return {
            value,
            label: ngxTranslate.instant(`label.${value}`),
        }
    }

    return null;
}