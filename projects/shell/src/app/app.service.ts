import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ElectronService } from "./data-access/electron.service";

@Injectable({ providedIn: 'root' })
export class AppService {
    private readonly _http = inject(HttpClient);
    private readonly electronService = inject(ElectronService);

    ping() {
        return this.electronService.handle('api/ping');
    }
}