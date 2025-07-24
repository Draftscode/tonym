import { inject, Injectable, signal } from "@angular/core";
import { MessageService } from "primeng/api";
import { finalize, tap } from "rxjs";
import { Content, toPdf } from "../utils/to-pdf";
import { ElectronService } from "./electron.service";

@Injectable({ providedIn: 'root' })
export class PdfService {
    private readonly _pMessage = inject(MessageService);
    private readonly _electronService = inject(ElectronService);

    isLoading = signal<boolean>(false);

    createPdf<T extends Content>(contents: T) {
        this.isLoading.set(true);

        const html = toPdf(contents);

        return this._electronService.handle<Uint8Array<ArrayBufferLike>>('api/pdf', html).pipe(
            finalize(() => this.isLoading.set(false)),
            tap(response => {
                this._pMessage.add({ closable: true, detail: 'Deine Pdf wurde  erfolgreich erstellt', summary: 'Pdf Erstellen', life: 100_000, severity: 'success' });
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'file.pdf'; // Set the filename
                document.body.appendChild(a);
                a.click();

                // Cleanup
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }));
    }
}