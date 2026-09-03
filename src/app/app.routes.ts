import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('@features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'forbidden',
    loadComponent: () =>
      import('@shared/pages/forbidden/forbidden.component').then((m) => m.ForbiddenComponent),
  },
  {
    path: '',
    loadComponent: () => import('@features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
