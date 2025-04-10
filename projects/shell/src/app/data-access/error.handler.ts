import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, inject } from "@angular/core";
import { MessageService } from "primeng/api";

export class GlobalErrorHandler implements ErrorHandler {
    private readonly _pMessage = inject(MessageService);

    handleError(error: HttpErrorResponse): void {
        console.error('Err', error);

        if (error instanceof HttpErrorResponse) {
            this._pMessage.add({ severity: 'error', life: 10_000, summary: 'Http Error', detail: error.message, closable: true });
        } else {
            this._pMessage.add({ severity: 'error', life: 10_000, summary: 'Local Error', detail: 'something went wrong', closable: true });
        }
    }

}