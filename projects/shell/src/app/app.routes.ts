import { Routes } from '@angular/router';
import { authGuard } from './data-access/auth.guard';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'app',
}, {
    canActivate: [authGuard],
    path: 'app',
    loadComponent: () => import('./features/app/app.component')
}, {
    path: 'login',
    loadComponent: () => import('./features/login/login.component')
}, {
    path: '**',
    redirectTo: '/'
}];
