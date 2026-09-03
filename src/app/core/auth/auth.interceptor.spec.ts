import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '@env/environment';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

const TOKEN_KEY = 'gi_access_token';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let router: { navigate: jasmine.Spy };

  beforeEach(() => {
    localStorage.clear();
    router = { navigate: jasmine.createSpy('navigate') };
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('adds the Authorization header for API calls when a token exists', () => {
    localStorage.setItem(TOKEN_KEY, 'tok123');

    http.get(`${environment.apiBaseUrl}/invoices`).subscribe();
    const req = httpMock.expectOne(`${environment.apiBaseUrl}/invoices`);

    expect(req.request.headers.get('Authorization')).toBe('Bearer tok123');
    req.flush([]);
  });

  it('does not add the header for non-API URLs', () => {
    localStorage.setItem(TOKEN_KEY, 'tok123');

    http.get('https://third-party.example.com/data').subscribe();
    const req = httpMock.expectOne('https://third-party.example.com/data');

    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('logs out and redirects to login on 401 for a non-login request', () => {
    localStorage.setItem(TOKEN_KEY, 'tok123');
    spyOn(auth, 'logout').and.callThrough();

    http.get(`${environment.apiBaseUrl}/invoices`).subscribe({ error: () => undefined });
    httpMock
      .expectOne(`${environment.apiBaseUrl}/invoices`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { session: 'expired' } });
  });

  it('redirects to /forbidden on 403', () => {
    http.get(`${environment.apiBaseUrl}/dashboard/summary`).subscribe({ error: () => undefined });
    httpMock
      .expectOne(`${environment.apiBaseUrl}/dashboard/summary`)
      .flush({}, { status: 403, statusText: 'Forbidden' });

    expect(router.navigate).toHaveBeenCalledWith(['/forbidden']);
  });

  it('does not log out on a 401 from the login endpoint', () => {
    spyOn(auth, 'logout');

    http.post(`${environment.apiBaseUrl}/auth/login`, {}).subscribe({ error: () => undefined });
    httpMock
      .expectOne(`${environment.apiBaseUrl}/auth/login`)
      .flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(auth.logout).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
