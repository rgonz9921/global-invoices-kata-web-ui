import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { environment } from '@env/environment';
import { DashboardSummary } from '@core/dashboard/dashboard.models';
import { DashboardPageComponent } from './dashboard-page.component';

const SUMMARY_URL = `${environment.apiBaseUrl}/dashboard/summary`;

const summary: DashboardSummary = {
  byType: [
    { type: 'NACIONAL', totalAmount: 1190, invoiceCount: 1 },
    { type: 'EXPORTACION', totalAmount: 0, invoiceCount: 0 },
    { type: 'GUBERNAMENTAL', totalAmount: 0, invoiceCount: 0 },
  ],
  grandTotal: 1190,
  totalInvoices: 1,
};

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPageComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        provideCharts(withDefaultRegisterables()),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the summary on init and renders the KPIs', () => {
    fixture.detectChanges();

    httpMock.expectOne(SUMMARY_URL).flush(summary);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Total facturado');
    expect(text).toContain('1,190');
    expect((fixture.nativeElement as HTMLElement).querySelector('canvas')).not.toBeNull();
  });

  it('shows an error message when the summary request fails', () => {
    fixture.detectChanges();

    httpMock
      .expectOne(SUMMARY_URL)
      .flush({}, { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No se pudo cargar el dashboard');
  });
});
