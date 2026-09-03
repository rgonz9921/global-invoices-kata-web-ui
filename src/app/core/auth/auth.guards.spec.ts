import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard, guestGuard, roleGuard } from './auth.guards';

const TOKEN_KEY = 'gi_access_token';

const encode = (value: unknown): string =>
  btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const makeToken = (claims: Record<string, unknown>): string =>
  `${encode({ alg: 'HS384' })}.${encode(claims)}.signature`;

const validSession = (role: 'OPERADOR' | 'AUDITOR'): void => {
  localStorage.setItem(
    TOKEN_KEY,
    makeToken({ sub: 'user@globalinvoice.com', role, exp: Math.floor(Date.now() / 1000) + 3600 }),
  );
};

const route = {} as ActivatedRouteSnapshot;
const stateFor = (url: string) => ({ url }) as RouterStateSnapshot;

const runGuard = <T>(fn: () => T): T => TestBed.runInInjectionContext(fn);

describe('auth guards', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
  });

  afterEach(() => localStorage.clear());

  describe('authGuard', () => {
    it('allows an authenticated user', () => {
      validSession('OPERADOR');
      expect(runGuard(() => authGuard(route, stateFor('/invoices')))).toBe(true);
    });

    it('redirects an anonymous user to /login keeping the requested url', () => {
      const result = runGuard(() => authGuard(route, stateFor('/invoices'))) as UrlTree;
      expect(result).toBeInstanceOf(UrlTree);
      expect(result.toString()).toBe('/login?redirect=%2Finvoices');
    });
  });

  describe('roleGuard', () => {
    it('allows the matching role', () => {
      validSession('AUDITOR');
      expect(runGuard(() => roleGuard('AUDITOR')(route, stateFor('/dashboard')))).toBe(true);
    });

    it('sends the wrong role to /forbidden', () => {
      validSession('OPERADOR');
      const result = runGuard(() => roleGuard('AUDITOR')(route, stateFor('/dashboard'))) as UrlTree;
      expect(result.toString()).toBe('/forbidden');
    });

    it('sends an anonymous user to /login', () => {
      const result = runGuard(() => roleGuard('AUDITOR')(route, stateFor('/dashboard'))) as UrlTree;
      expect(result.toString()).toBe('/login');
    });
  });

  describe('guestGuard', () => {
    it('lets an anonymous user reach /login', () => {
      expect(runGuard(() => guestGuard(route, stateFor('/login')))).toBe(true);
    });

    it('bounces an authenticated OPERADOR to /invoices', () => {
      validSession('OPERADOR');
      const result = runGuard(() => guestGuard(route, stateFor('/login'))) as UrlTree;
      expect(result.toString()).toBe('/invoices');
    });

    it('bounces an authenticated AUDITOR to /dashboard', () => {
      validSession('AUDITOR');
      const result = runGuard(() => guestGuard(route, stateFor('/login'))) as UrlTree;
      expect(result.toString()).toBe('/dashboard');
    });
  });
});
