import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { environment } from '@env/environment';
import { InvoiceResponse, PageResponse } from '@core/models/invoice.models';
import { InvoiceListComponent } from './invoice-list.component';

const INVOICES_URL = `${environment.apiBaseUrl}/invoices`;
const TOKEN_KEY = 'gi_access_token';

const encode = (value: unknown): string =>
  btoa(JSON.stringify(value)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const tokenFor = (role: string): string =>
  `${encode({ alg: 'HS384' })}.${encode({
    sub: 'user@globalinvoice.com',
    role,
    exp: Math.floor(Date.now() / 1000) + 3600,
  })}.signature`;

const page = (content: InvoiceResponse[]): PageResponse<InvoiceResponse> => ({
  content,
  page: 0,
  size: 10,
  totalElements: content.length,
  totalPages: 1,
  last: true,
});

const sampleInvoice: InvoiceResponse = {
  id: '1',
  type: 'NACIONAL',
  description: 'Consultoria',
  subtotal: 1000,
  customsCode: null,
  totals: { subtotal: 1000, iva: 190, retencion: 0, total: 1190 },
  createdAt: '2026-09-03T00:00:00Z',
  createdBy: 'operador@globalinvoice.com',
};

async function setup(role: string): Promise<{
  fixture: ComponentFixture<InvoiceListComponent>;
  component: InvoiceListComponent;
  httpMock: HttpTestingController;
}> {
  localStorage.setItem(TOKEN_KEY, tokenFor(role));
  await TestBed.configureTestingModule({
    imports: [InvoiceListComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      provideNoopAnimations(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(InvoiceListComponent);
  const component = fixture.componentInstance;
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, component, httpMock };
}

describe('InvoiceListComponent', () => {
  afterEach(() => localStorage.clear());

  it('loads the first page on init', async () => {
    const { fixture, component, httpMock } = await setup('OPERADOR');
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url === INVOICES_URL);
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush(page([sampleInvoice]));

    expect(component.invoices.length).toBe(1);
    expect(component.totalElements).toBe(1);
    httpMock.verify();
  });

  it('resets to the first page and applies the type filter on filter change', async () => {
    const { fixture, component, httpMock } = await setup('AUDITOR');
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === INVOICES_URL).flush(page([sampleInvoice]));

    component.pageIndex = 3;
    component.typeFilter = 'EXPORTACION';
    component.onFilterChange();

    const req = httpMock.expectOne((r) => r.url === INVOICES_URL);
    expect(component.pageIndex).toBe(0);
    expect(req.request.params.get('type')).toBe('EXPORTACION');
    expect(req.request.params.get('page')).toBe('0');
    req.flush(page([]));
    httpMock.verify();
  });

  it('reloads with the new page and size on paginator change', async () => {
    const { fixture, component, httpMock } = await setup('OPERADOR');
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === INVOICES_URL).flush(page([sampleInvoice]));

    component.onPage({ pageIndex: 2, pageSize: 20, length: 100 });

    const req = httpMock.expectOne((r) => r.url === INVOICES_URL);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('20');
    req.flush(page([]));
    httpMock.verify();
  });

  it('allows creating invoices only for OPERADOR', async () => {
    const operador = await setup('OPERADOR');
    expect(operador.component.canCreate).toBe(true);
    operador.fixture.detectChanges();
    operador.httpMock.expectOne((r) => r.url === INVOICES_URL).flush(page([]));
    operador.httpMock.verify();

    TestBed.resetTestingModule();
    localStorage.clear();

    const auditor = await setup('AUDITOR');
    expect(auditor.component.canCreate).toBe(false);
    auditor.fixture.detectChanges();
    auditor.httpMock.expectOne((r) => r.url === INVOICES_URL).flush(page([]));
    auditor.httpMock.verify();
  });
});
