import { HttpClient, httpResource } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";

export type User = {

};

class TUser {
    static parse(value: unknown): User | null {
        console.log('PARSE')
        return {};
    }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly _http = inject(HttpClient);

    private readonly _me = httpResource(
        () => {
            return {
                url: `${environment.origin}/me`,
            }
        }, {
        parse: TUser.parse,
        defaultValue: undefined
    });

    getMe() {
        return this._me;
    }

    login(username: string, password: string) {
        return new Observable((obs) => {
            const _user = {} as User;
            this._me.set(_user);
            obs.next(_user);
            obs.complete();
        });
    }
}