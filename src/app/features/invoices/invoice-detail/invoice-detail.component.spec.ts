import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { environment } from '@env/environment';
import { InvoiceDetailResponse } from '@core/models/invoice.models';
import { InvoiceDetailComponent } from './invoice-detail.component';

const INVOICES_URL = `${environment.apiBaseUrl}/invoices`;

const baseDetail: InvoiceDetailResponse = {
  id: 'abc',
  type: 'NACIONAL',
  description: 'Consultoria',
  subtotal: 1000,
  customsCode: null,
  totals: { subtotal: 1000, iva: 190, retencion: 0, total: 1190 },
  createdAt: '2026-09-03T00:00:00Z',
  createdBy: 'operador@globalinvoice.com',
  amountInWordsAvailable: true,
  amountInWords: 'mil ciento noventa',
};

async function render(id: string): Promise<{
  fixture: ComponentFixture<InvoiceDetailComponent>;
  component: InvoiceDetailComponent;
  httpMock: HttpTestingController;
}> {
  await TestBed.configureTestingModule({
    imports: [InvoiceDetailComponent],
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      provideRouter([]),
      provideNoopAnimations(),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(InvoiceDetailComponent);
  const component = fixture.componentInstance;
  component.id = id;
  const httpMock = TestBed.inject(HttpTestingController);
  return { fixture, component, httpMock };
}

describe('InvoiceDetailComponent (RF-03)', () => {
  it('shows the amount in words when the backend resolved it', async () => {
    const { fixture, httpMock } = await render('abc');
    fixture.detectChanges();

    httpMock.expectOne(`${INVOICES_URL}/abc`).flush(baseDetail);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('mil ciento noventa');
    expect(text).not.toContain('no disponible');
    httpMock.verify();
  });

  it('falls back to a message when the conversion is unavailable', async () => {
    const { fixture, httpMock } = await render('abc');
    fixture.detectChanges();

    httpMock
      .expectOne(`${INVOICES_URL}/abc`)
      .flush({ ...baseDetail, amountInWordsAvailable: false, amountInWords: null });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Monto en palabras');
    expect(text).toContain('no esta disponible');
    httpMock.verify();
  });

  it('marks the invoice as not found on a 404', async () => {
    const { fixture, component, httpMock } = await render('missing');
    fixture.detectChanges();

    httpMock
      .expectOne(`${INVOICES_URL}/missing`)
      .flush({}, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();

    expect(component.notFound).toBeTrue();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('La factura no existe');
    httpMock.verify();
  });
});
