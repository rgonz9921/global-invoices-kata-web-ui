import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InvoiceService } from '@core/invoices/invoice.service';
import {
  ApiValidationError,
  CreateInvoiceRequest,
  INVOICE_TYPES,
  InvoiceResponse,
  InvoiceType,
} from '@core/models/invoice.models';

interface InvoiceFormModel {
  type: FormControl<InvoiceType>;
  description: FormControl<string>;
  subtotal: FormControl<number | null>;
  customsCode?: FormControl<string>;
}

@Component({
  selector: 'app-invoice-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    CurrencyPipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './invoice-form.component.html',
  styleUrl: './invoice-form.component.scss',
})
export class InvoiceFormComponent {
  private readonly invoiceService = inject(InvoiceService);
  private readonly snackBar = inject(MatSnackBar);

  readonly types = INVOICE_TYPES;

  loading = false;
  result: InvoiceResponse | null = null;

  readonly form = new FormGroup<InvoiceFormModel>({
    type: new FormControl<InvoiceType>('NACIONAL', {
      nonNullable: true,
      validators: Validators.required,
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    subtotal: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)],
    }),
  });

  constructor() {
    this.form.controls.type.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((type) => this.syncCustomsCode(type));
  }

  get customsCodeControl(): FormControl<string> | undefined {
    return this.form.controls.customsCode;
  }

  submit(): void {
    if (this.loading) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.result = null;

    this.invoiceService.create(this.buildRequest()).subscribe({
      next: (invoice) => {
        this.loading = false;
        this.result = invoice;
        this.snackBar.open(`Factura ${invoice.type} creada`, 'OK', { duration: 4000 });
        this.form.reset({ type: 'NACIONAL', description: '', subtotal: null });
        this.syncCustomsCode('NACIONAL');
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.applyServerErrors(error);
      },
    });
  }

  private buildRequest(): CreateInvoiceRequest {
    const value = this.form.getRawValue();
    const request: CreateInvoiceRequest = {
      type: value.type,
      description: value.description.trim(),
      subtotal: value.subtotal as number,
    };
    if (value.type === 'EXPORTACION' && value.customsCode) {
      request.customsCode = value.customsCode.trim();
    }
    return request;
  }

  private syncCustomsCode(type: InvoiceType): void {
    if (type === 'EXPORTACION') {
      if (!this.form.contains('customsCode')) {
        this.form.addControl(
          'customsCode',
          new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.maxLength(40)],
          }),
        );
      }
    } else if (this.form.contains('customsCode')) {
      this.form.removeControl('customsCode');
    }
  }

  private applyServerErrors(error: HttpErrorResponse): void {
    const body = error.error as ApiValidationError | null;
    if (body?.fields) {
      for (const [key, message] of Object.entries(body.fields)) {
        this.form.get(key)?.setErrors({ server: message });
      }
    }
    this.snackBar.open(body?.message ?? 'No se pudo crear la factura', 'Cerrar', { duration: 5000 });
  }
}
