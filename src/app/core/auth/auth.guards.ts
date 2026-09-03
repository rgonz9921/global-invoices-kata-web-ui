import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../models/auth.models';
import { AuthService } from './auth.service';
import { landingRouteForRole } from './redirect';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
};

export const roleGuard =
  (role: UserRole): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(role)) {
      return true;
    }
    return router.createUrlTree([auth.isAuthenticated() ? '/forbidden' : '/login']);
  };

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;
  if (auth.isAuthenticated() && user) {
    return router.createUrlTree([landingRouteForRole(user.role)]);
  }
  return true;
};
