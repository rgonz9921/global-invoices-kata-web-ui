import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';

const TOKEN_KEY = 'gi_access_token';

const encode = (value: unknown): string =>
  btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const tokenFor = (role: string): string =>
  `${encode({ alg: 'HS384' })}.${encode({
    sub: 'user@globalinvoice.com',
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.signature`;

describe('AppComponent', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('creates the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the brand and no session controls when logged out', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.brand')?.textContent).toContain('Global Invoice');
    expect(compiled.querySelector('button')).toBeNull();
  });

  it('shows only the Facturas link for an OPERADOR session', () => {
    localStorage.setItem(TOKEN_KEY, tokenFor('OPERADOR'));
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Facturas');
    expect(text).not.toContain('Dashboard');
  });

  it('shows only the Dashboard link for an AUDITOR session', () => {
    localStorage.setItem(TOKEN_KEY, tokenFor('AUDITOR'));
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain('Dashboard');
    expect(text).not.toContain('Facturas');
  });
});
