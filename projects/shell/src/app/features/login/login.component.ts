import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DividerModule } from "primeng/divider";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from 'primeng/password';
import { lastValueFrom } from "rxjs";
import { AuthService } from "../../data-access/auth.service";

@Component({
    selector: 'login-auth',
    templateUrl: 'login.component.html',
    imports: [InputTextModule, ReactiveFormsModule, PasswordModule, CardModule, ButtonModule, DividerModule]
})
export default class LoginComponent {
    private readonly _authService = inject(AuthService);
    private readonly _router = inject(Router);

    protected readonly _formGroup = new FormGroup({
        username: new FormControl<string>('', [Validators.required]),
        password: new FormControl<string>('', [Validators.required]),
    });

    protected async _onLogin() {
        if (this._formGroup.invalid) { return; }

        const { username, password } = this._formGroup.getRawValue();
        const user = await lastValueFrom(this._authService.login(username!, password!));
        if (user) {
            this._router.navigate(['/']);
        }
    }
}