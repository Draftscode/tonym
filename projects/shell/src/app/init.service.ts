import { inject, Injectable, signal } from "@angular/core";
import { BlaudirektService } from "./data-access/blaudirekt.service";

@Injectable({ providedIn: 'root' })
export class InitService {
    private readonly blaudirektService = inject(BlaudirektService);

    initialized = signal<boolean>(false);

    async initAll() {
        try {
            await Promise.all([
                this.blaudirektService.init(),
            ]);
        } catch (e) {
            console.error('failed to initialize', e);
        } finally {
            this.initialized.set(true);
        }
    }
}