import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { environment } from '@env/environment';
import { LoginComponent } from './login.component';

const LOGIN_URL = `${environment.apiBaseUrl}/auth/login`;

const encode = (value: unknown): string =>
  btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const tokenFor = (role: string): string =>
  `${encode({ alg: 'HS384' })}.${encode({
    sub: 'user@globalinvoice.com',
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.signature`;

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: { navigateByUrl: jest.Mock };
  let redirectParam: string | null;

  beforeEach(async () => {
    localStorage.clear();
    redirectParam = null;
    router = { navigateByUrl: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParamMap() {
                return convertToParamMap(redirectParam ? { redirect: redirectParam } : {});
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  const submitWith = (role: string): void => {
    component.form.setValue({ email: 'user@globalinvoice.com', password: 'secret' });
    component.submit();
    httpMock
      .expectOne(LOGIN_URL)
      .flush({ accessToken: tokenFor(role), tokenType: 'Bearer', expiresIn: 3600 });
  };

  it('does not call the API when the form is empty', () => {
    component.submit();

    httpMock.expectNone(LOGIN_URL);
    expect(component.form.touched).toBe(true);
  });

  it('redirects an OPERADOR to /invoices after login', () => {
    submitWith('OPERADOR');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/invoices');
    expect(component.loading).toBe(false);
  });

  it('redirects an AUDITOR to /dashboard after login', () => {
    submitWith('AUDITOR');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('honours the redirect query param when present', () => {
    redirectParam = '/invoices/new';
    submitWith('OPERADOR');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/invoices/new');
  });

  it('shows an error message on invalid credentials', () => {
    component.form.setValue({ email: 'user@globalinvoice.com', password: 'wrong' });
    component.submit();
    httpMock.expectOne(LOGIN_URL).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.errorMessage).toContain('Credenciales');
    expect(component.loading).toBe(false);
  });
});
