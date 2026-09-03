import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from '@core/auth/auth.guards';
import { AuthService } from '@core/auth/auth.service';
import { landingRouteForRole } from '@core/auth/redirect';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('@features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      const router = inject(Router);
      const user = auth.currentUser;
      return auth.isAuthenticated() && user
        ? landingRouteForRole(user.role)
        : router.parseUrl('/login');
    },
  },
  {
    path: 'invoices',
    canActivate: [authGuard, roleGuard('OPERADOR')],
    loadComponent: () =>
      import('@features/invoices/invoices-page.component').then((m) => m.InvoicesPageComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, roleGuard('AUDITOR')],
    loadComponent: () =>
      import('@features/dashboard/dashboard-page.component').then((m) => m.DashboardPageComponent),
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('@shared/pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
