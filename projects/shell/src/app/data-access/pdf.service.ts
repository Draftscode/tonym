import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { MessageService } from "primeng/api";
import { catchError, finalize, tap } from "rxjs";
import { environment } from "../../environments/environment";
import { Content, toPdf } from "../utils/to-pdf";
import { ElectronService } from "./electron.service";

@Injectable({ providedIn: 'root' })
export class PdfService {
    private readonly _http = inject(HttpClient);
    private readonly _pMessage = inject(MessageService);
    private readonly _electronService = inject(ElectronService);

    isLoading = signal<boolean>(false);

    createPdf<T extends Content>(contents: T) {
        this.isLoading.set(true);

        const html = toPdf(contents);

        console.log('REQUEST pdf')
        return this._http.post(`${environment.origin}/pdf`, { content: html }, { responseType: 'blob' }).pipe(
            finalize(() => this.isLoading.set(false)),
            tap(response => {

                console.log('Received Result')
                this._electronService.writeFile(`${contents.firstname.toLowerCase()}_-_${contents.lastname.toLowerCase()}`, contents);
                console.log('WRITE FILE DONE');

                this._pMessage.add({ closable: true, detail: 'Deine Pdf wurde  erfolgreich erstellt', summary: 'Pdf Erstellen', life: 100_000, severity: 'success' });
                console.log('WRITE FILE DOWNLOAD')
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                console.log('DONE FILE DOWNLOAD')
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