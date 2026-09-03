import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { environment } from '@env/environment';
import { LoginComponent } from './login.component';

const LOGIN_URL = `${environment.apiBaseUrl}/auth/login`;

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let httpMock: HttpTestingController;
  let router: { navigateByUrl: jasmine.Spy };

  beforeEach(async () => {
    localStorage.clear();
    router = { navigateByUrl: jasmine.createSpy('navigateByUrl') };
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: Router, useValue: router },
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

  it('does not call the API when the form is empty', () => {
    component.submit();

    httpMock.expectNone(LOGIN_URL);
    expect(component.form.touched).toBeTrue();
  });

  it('logs in and navigates home on success', () => {
    component.form.setValue({ email: 'operador@globalinvoice.com', password: 'Operador123!' });

    component.submit();
    httpMock.expectOne(LOGIN_URL).flush({ accessToken: 'header.payload.sig', tokenType: 'Bearer', expiresIn: 3600 });

    expect(router.navigateByUrl).toHaveBeenCalledWith('/');
    expect(component.loading).toBeFalse();
  });

  it('shows an error message on invalid credentials', () => {
    component.form.setValue({ email: 'operador@globalinvoice.com', password: 'wrong' });

    component.submit();
    httpMock.expectOne(LOGIN_URL).flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.errorMessage).toContain('Credenciales');
    expect(component.loading).toBeFalse();
  });
});
