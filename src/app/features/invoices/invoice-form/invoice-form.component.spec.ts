import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@env/environment';
import { InvoiceResponse } from '@core/models/invoice.models';
import { InvoiceFormComponent } from './invoice-form.component';

const INVOICES_URL = `${environment.apiBaseUrl}/invoices`;

const createdInvoice: InvoiceResponse = {
  id: 'abc',
  type: 'NACIONAL',
  description: 'Consultoria',
  subtotal: 1000,
  customsCode: null,
  totals: { subtotal: 1000, iva: 190, retencion: 0, total: 1190 },
  createdAt: '2026-09-03T00:00:00Z',
  createdBy: 'operador@globalinvoice.com',
};

describe('InvoiceFormComponent (RF-02)', () => {
  let fixture: ComponentFixture<InvoiceFormComponent>;
  let component: InvoiceFormComponent;
  let httpMock: HttpTestingController;
  let snackBar: { open: jest.Mock };

  beforeEach(async () => {
    snackBar = { open: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [InvoiceFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideNoopAnimations(),
        { provide: MatSnackBar, useValue: snackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InvoiceFormComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('adds a required customsCode control only when the type is EXPORTACION', () => {
    expect(component.form.contains('customsCode')).toBe(false);

    component.form.controls.type.setValue('EXPORTACION');

    expect(component.form.contains('customsCode')).toBe(true);
    const control = component.form.get('customsCode')!;
    expect(control.hasError('required')).toBe(true);
  });

  it('removes the customsCode control when switching away from EXPORTACION', () => {
    component.form.controls.type.setValue('EXPORTACION');
    component.form.controls.type.setValue('NACIONAL');

    expect(component.form.contains('customsCode')).toBe(false);
  });

  it('does not send customsCode in the payload for a non-EXPORTACION invoice', () => {
    component.form.patchValue({ type: 'NACIONAL', description: 'Consultoria', subtotal: 1000 });

    component.submit();

    const req = httpMock.expectOne(INVOICES_URL);
    expect(req.request.body).toEqual({ type: 'NACIONAL', description: 'Consultoria', subtotal: 1000 });
    expect('customsCode' in req.request.body).toBe(false);
    req.flush(createdInvoice);
  });

  it('sends customsCode for an EXPORTACION invoice', () => {
    component.form.controls.type.setValue('EXPORTACION');
    component.form.patchValue({ description: 'Cafe', subtotal: 500 });
    component.form.get('customsCode')!.setValue('COL-123');

    component.submit();

    const req = httpMock.expectOne(INVOICES_URL);
    expect(req.request.body).toEqual({
      type: 'EXPORTACION',
      description: 'Cafe',
      subtotal: 500,
      customsCode: 'COL-123',
    });
    req.flush({ ...createdInvoice, type: 'EXPORTACION', customsCode: 'COL-123' });
  });

  it('blocks the submit and marks the form as touched when invalid', () => {
    component.submit();

    httpMock.expectNone(INVOICES_URL);
    expect(component.form.touched).toBe(true);
  });

  it('maps backend field errors onto the matching controls', () => {
    component.form.controls.type.setValue('EXPORTACION');
    component.form.patchValue({ description: 'Cafe', subtotal: 500 });
    component.form.get('customsCode')!.setValue('irrelevante');

    component.submit();

    httpMock.expectOne(INVOICES_URL).flush(
      {
        status: 400,
        error: 'Bad Request',
        message: 'Error de validacion en la peticion',
        fields: { customsCode: 'El codigo aduanero es obligatorio para facturas de exportacion' },
        timestamp: '2026-09-03T00:00:00Z',
      },
      { status: 400, statusText: 'Bad Request' },
    );

    expect(component.form.get('customsCode')!.getError('server')).toContain('obligatorio');
    expect(snackBar.open).toHaveBeenCalled();
  });

  it('exposes the computed totals after a successful create', () => {
    component.form.patchValue({ type: 'NACIONAL', description: 'Consultoria', subtotal: 1000 });

    component.submit();
    httpMock.expectOne(INVOICES_URL).flush(createdInvoice);

    expect(component.result?.totals.total).toBe(1190);
    expect(component.form.controls.description.value).toBe('');
  });
});
