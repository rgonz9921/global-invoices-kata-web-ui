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
});
