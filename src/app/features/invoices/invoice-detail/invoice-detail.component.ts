import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { InvoiceService } from '@core/invoices/invoice.service';
import { InvoiceDetailResponse } from '@core/models/invoice.models';

@Component({
  selector: 'app-invoice-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, MatCardModule, MatButtonModule, MatProgressBarModule],
  templateUrl: './invoice-detail.component.html',
  styleUrl: './invoice-detail.component.scss',
})
export class InvoiceDetailComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);

  @Input() id!: string;

  loading = true;
  notFound = false;
  loadError = false;
  invoice: InvoiceDetailResponse | null = null;

  ngOnInit(): void {
    this.invoiceService.getById(this.id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        this.notFound = error.status === 404;
        this.loadError = !this.notFound;
      },
    });
  }
}
