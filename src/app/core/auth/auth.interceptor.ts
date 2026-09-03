import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token;
  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const isLoginRequest = req.url.endsWith('/auth/login');

  const outgoing =
    token && isApiRequest
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(outgoing).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isLoginRequest) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { session: 'expired' } });
      } else if (error.status === 403) {
        router.navigate(['/forbidden']);
      }
      return throwError(() => error);
    }),
  );
};
