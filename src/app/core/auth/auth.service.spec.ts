import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { AuthUser } from '../models/auth.models';
import { AuthService } from './auth.service';

const TOKEN_KEY = 'gi_access_token';
const LOGIN_URL = `${environment.apiBaseUrl}/auth/login`;

const encode = (value: unknown): string =>
  btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const makeToken = (claims: Record<string, unknown>): string =>
  `${encode({ alg: 'HS384' })}.${encode(claims)}.signature`;

const inSeconds = (offset: number): number => Math.floor(Date.now() / 1000) + offset;

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores the token and emits the decoded user on login', () => {
    const token = makeToken({ sub: 'operador@globalinvoice.com', role: 'OPERADOR', exp: inSeconds(3600) });
    let emitted: AuthUser | null = null;
    service.user$.subscribe((user) => (emitted = user));

    service.login({ email: 'operador@globalinvoice.com', password: 'x' }).subscribe();
    httpMock.expectOne(LOGIN_URL).flush({ accessToken: token, tokenType: 'Bearer', expiresIn: 3600 });

    expect(localStorage.getItem(TOKEN_KEY)).toBe(token);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.hasRole('OPERADOR')).toBe(true);
    expect(service.hasRole('AUDITOR')).toBe(false);
    expect(emitted!.email).toBe('operador@globalinvoice.com');
  });

  it('clears the session on logout', () => {
    const token = makeToken({ sub: 'a@b.com', role: 'AUDITOR', exp: inSeconds(3600) });
    service.login({ email: 'a@b.com', password: 'x' }).subscribe();
    httpMock.expectOne(LOGIN_URL).flush({ accessToken: token, tokenType: 'Bearer', expiresIn: 3600 });

    service.logout();

    expect(service.currentUser).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });

  it('treats an expired token as not authenticated', () => {
    const token = makeToken({ sub: 'a@b.com', role: 'AUDITOR', exp: inSeconds(-10) });
    service.login({ email: 'a@b.com', password: 'x' }).subscribe();
    httpMock.expectOne(LOGIN_URL).flush({ accessToken: token, tokenType: 'Bearer', expiresIn: -10 });

    expect(service.isAuthenticated()).toBe(false);
    expect(service.hasRole('AUDITOR')).toBe(false);
  });

  it('restores a valid session from localStorage on creation', () => {
    const token = makeToken({ sub: 'restored@b.com', role: 'OPERADOR', exp: inSeconds(3600) });
    localStorage.setItem(TOKEN_KEY, token);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fresh = TestBed.inject(AuthService);

    expect(fresh.currentUser?.email).toBe('restored@b.com');
    expect(fresh.isAuthenticated()).toBe(true);
  });

  it('discards an expired token found in localStorage on creation', () => {
    localStorage.setItem(TOKEN_KEY, makeToken({ sub: 'old@b.com', role: 'OPERADOR', exp: inSeconds(-5) }));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const fresh = TestBed.inject(AuthService);

    expect(fresh.currentUser).toBeNull();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
