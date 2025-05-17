import { inject, Injectable } from "@angular/core";
import { ElectronService } from "./electron.service";
import { lastValueFrom, tap } from "rxjs";

export type GdvMember = {
    name: string;
    image: string;
};

@Injectable({ providedIn: 'root' })
export class GdvService {
    private readonly electronService = inject(ElectronService);

    async getGdvMembers(query: string) {
        return lastValueFrom(this.electronService.handle<GdvMember[]>(`api/gdv/members`, { query }));
    }
}