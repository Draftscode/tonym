import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { finalize, tap } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: 'root' })
export class PdfService {
    private readonly _http = inject(HttpClient);

    isLoading = signal<boolean>(false);

    createPdf<T = unknown>(contents: T) {
        this.isLoading.set(true);
        return this._http.post(`${environment.origin}/pdf`, contents, { responseType: 'blob' }).pipe(
            finalize(() => this.isLoading.set(false)),
            tap(response => {
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