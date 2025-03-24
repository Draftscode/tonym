import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { lastValueFrom, Observable } from "rxjs";

declare global {
    interface Window {
        electron: any;
    }
}

@Injectable({ providedIn: 'root' })
export class AppService {
    private readonly _http = inject(HttpClient);

    ping() {
        
        return this._http.get(`${environment.origin}/ping`);
    }
}