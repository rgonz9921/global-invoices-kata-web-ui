import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '@env/environment';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from './dashboard.models';

const SUMMARY_URL = `${environment.apiBaseUrl}/dashboard/summary`;

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('GETs the dashboard summary', () => {
    const summary: DashboardSummary = {
      byType: [{ type: 'NACIONAL', totalAmount: 1000, invoiceCount: 1 }],
      grandTotal: 1000,
      totalInvoices: 1,
    };
    let received: DashboardSummary | undefined;
    service.getSummary().subscribe((value) => (received = value));

    const req = httpMock.expectOne(SUMMARY_URL);
    expect(req.request.method).toBe('GET');
    req.flush(summary);

    expect(received).toEqual(summary);
  });
});
