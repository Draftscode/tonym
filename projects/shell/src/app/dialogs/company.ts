import { Component, computed, inject, input } from "@angular/core";
import { BlaudirectContract, BlaudirektService } from "../data-access/blaudirekt.service";

@Component({
    selector: 'app-company',
    template: `
    @if(company(); as company) {
    <div class="flex gap-2 items-center">
        <img style="height: 32px; width: 100px; object-fit: contain" [src]="company.Logos[0].Pfad" alt="Company Logo" />
        <span>{{company.Text}}</span>
    </div>
    }
    `
})
export class CompanyComponent {
    private readonly blaudirektService = inject(BlaudirektService);
    contract = input<BlaudirectContract>();

    protected readonly company = computed(() => {
        const company = this.blaudirektService.companies()?.find(company => company.Value === this.contract()?.Gesellschaft);
        return company;
    });
}