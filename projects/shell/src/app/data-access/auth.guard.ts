import { inject } from "@angular/core";
import { toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from "@angular/router";
import { filter, map } from "rxjs";
import { AuthService } from "./auth.service";

export function authGuard(actovatedRoute: ActivatedRouteSnapshot, route: RouterStateSnapshot) {
    const _resource = inject(AuthService).getMe();
    const _status$ = toObservable(_resource.status);
    const _router = inject(Router);

    return _status$.pipe(
        filter(status => [0, 2, 3].indexOf(status) === -1),
        map(_ => {
            const me = _resource.value();
            if (me) {
                return true;
            } else {
                return _router.createUrlTree(['/', 'login']);
            }
        }));
}
