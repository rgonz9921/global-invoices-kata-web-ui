import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { InvoiceResponse } from '@core/models/invoice.models';
import { InvoiceService } from './invoice.service';

const INVOICES_URL = `${environment.apiBaseUrl}/invoices`;

const fakeInvoice: InvoiceResponse = {
  id: 'abc',
  type: 'NACIONAL',
  description: 'Consultoria',
  subtotal: 1000,
  customsCode: null,
  totals: { subtotal: 1000, iva: 190, retencion: 0, total: 1190 },
  createdAt: '2026-09-03T00:00:00Z',
  createdBy: 'operador@globalinvoice.com',
};

describe('InvoiceService', () => {
  let service: InvoiceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InvoiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs the create request and returns the created invoice', () => {
    let received: InvoiceResponse | undefined;
    service
      .create({ type: 'NACIONAL', description: 'Consultoria', subtotal: 1000 })
      .subscribe((invoice) => (received = invoice));

    const req = httpMock.expectOne(INVOICES_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ type: 'NACIONAL', description: 'Consultoria', subtotal: 1000 });

    req.flush(fakeInvoice);
    expect(received).toEqual(fakeInvoice);
  });

  it('lists invoices with the given filter and pagination params', () => {
    service.list({ type: 'EXPORTACION', page: 2, size: 5 }).subscribe();

    const req = httpMock.expectOne(
      (request) => request.method === 'GET' && request.url === INVOICES_URL,
    );
    expect(req.request.params.get('type')).toBe('EXPORTACION');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('size')).toBe('5');
    req.flush({ content: [], page: 2, size: 5, totalElements: 0, totalPages: 0, last: true });
  });

  it('omits the type param when no filter is given', () => {
    service.list({ page: 0, size: 10 }).subscribe();

    const req = httpMock.expectOne((request) => request.url === INVOICES_URL);
    expect(req.request.params.has('type')).toBeFalse();
    req.flush({ content: [], page: 0, size: 10, totalElements: 0, totalPages: 0, last: true });
  });

  it('fetches a single invoice detail by id', () => {
    service.getById('abc').subscribe();

    const req = httpMock.expectOne(`${INVOICES_URL}/abc`);
    expect(req.request.method).toBe('GET');
    req.flush({ ...fakeInvoice, amountInWords: 'mil', amountInWordsAvailable: true });
  });
});
