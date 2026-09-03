import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '@env/environment';
import { AuthUser, LoginRequest, LoginResponse, UserRole } from '../models/auth.models';
import { decodeJwtPayload } from './jwt';

const TOKEN_KEY = 'gi_access_token';

interface JwtClaims {
  sub: string;
  role: UserRole;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly loginUrl = `${environment.apiBaseUrl}/auth/login`;

  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.restoreSession());
  readonly user$: Observable<AuthUser | null> = this.userSubject.asObservable();

  get currentUser(): AuthUser | null {
    return this.userSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.loginUrl, credentials)
      .pipe(tap((response) => this.storeSession(response.accessToken)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.userSubject.next(null);
  }

  isAuthenticated(): boolean {
    const user = this.userSubject.value;
    return !!user && user.expiresAt > Date.now();
  }

  hasRole(role: UserRole): boolean {
    return this.isAuthenticated() && this.userSubject.value?.role === role;
  }

  private storeSession(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.userSubject.next(this.toAuthUser(token));
  }

  private restoreSession(): AuthUser | null {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      return null;
    }
    const user = this.toAuthUser(token);
    if (!user || user.expiresAt <= Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return user;
  }

  private toAuthUser(token: string): AuthUser | null {
    const claims = decodeJwtPayload<JwtClaims>(token);
    if (!claims?.sub || !claims.role || !claims.exp) {
      return null;
    }
    return { email: claims.sub, role: claims.role, expiresAt: claims.exp * 1000 };
  }
}
