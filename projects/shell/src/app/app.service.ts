import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../environments/environment";

@Injectable({ providedIn: 'root' })
export class AppService {
    private readonly _http = inject(HttpClient);

    ping() {

        return this._http.get(`${environment.origin}/ping`);
    }
}