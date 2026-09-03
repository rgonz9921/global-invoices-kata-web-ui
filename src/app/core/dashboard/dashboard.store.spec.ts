import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { InvoiceEventsService } from '@core/invoices/invoice-events.service';
import { InvoiceResponse } from '@core/models/invoice.models';
import { DashboardStore } from './dashboard.store';
import { DashboardSummary } from './dashboard.models';

const SUMMARY_URL = `${environment.apiBaseUrl}/dashboard/summary`;

const baseSummary: DashboardSummary = {
  byType: [
    { type: 'NACIONAL', totalAmount: 1000, invoiceCount: 1 },
    { type: 'EXPORTACION', totalAmount: 0, invoiceCount: 0 },
    { type: 'GUBERNAMENTAL', totalAmount: 0, invoiceCount: 0 },
  ],
  grandTotal: 1000,
  totalInvoices: 1,
};

const invoice = (type: InvoiceResponse['type'], total: number): InvoiceResponse => ({
  id: 'x',
  type,
  description: 'y',
  subtotal: total,
  customsCode: null,
  totals: { subtotal: total, iva: 0, retencion: 0, total },
  createdAt: '',
  createdBy: '',
});

describe('DashboardStore', () => {
  let store: DashboardStore;
  let httpMock: HttpTestingController;
  let events: InvoiceEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(DashboardStore);
    httpMock = TestBed.inject(HttpTestingController);
    events = TestBed.inject(InvoiceEventsService);
  });

  afterEach(() => httpMock.verify());

  const currentSummary = (): DashboardSummary | null => {
    let summary: DashboardSummary | null = null;
    store.summary$.subscribe((value) => (summary = value)).unsubscribe();
    return summary;
  };

  it('fetches the summary once and skips a second load', () => {
    store.load();
    httpMock.expectOne(SUMMARY_URL).flush(baseSummary);

    store.load();
    httpMock.expectNone(SUMMARY_URL);

    expect(currentSummary()).toEqual(baseSummary);
  });

  it('reload() forces a new backend request', () => {
    store.load();
    httpMock.expectOne(SUMMARY_URL).flush(baseSummary);

    store.reload();
    httpMock.expectOne(SUMMARY_URL).flush({ ...baseSummary, totalInvoices: 9 });

    expect(currentSummary()?.totalInvoices).toBe(9);
  });

  it('applies a created invoice in memory without calling the backend (RF-04)', () => {
    store.load();
    httpMock.expectOne(SUMMARY_URL).flush(baseSummary);

    events.emitCreated(invoice('NACIONAL', 1190));

    httpMock.expectNone(SUMMARY_URL);
    const summary = currentSummary()!;
    expect(summary.totalInvoices).toBe(2);
    expect(summary.grandTotal).toBe(2190);
    const nacional = summary.byType.find((entry) => entry.type === 'NACIONAL')!;
    expect(nacional.totalAmount).toBe(2190);
    expect(nacional.invoiceCount).toBe(2);
  });

  it('ignores created events while no summary is loaded', () => {
    events.emitCreated(invoice('EXPORTACION', 500));

    expect(currentSummary()).toBeNull();
    httpMock.expectNone(SUMMARY_URL);
  });
});
