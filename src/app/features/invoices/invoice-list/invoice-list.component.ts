import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '@core/auth/auth.service';
import { InvoiceService } from '@core/invoices/invoice.service';
import { INVOICE_TYPES, InvoiceResponse, InvoiceType } from '@core/models/invoice.models';

@Component({
  selector: 'app-invoice-list',
  imports: [
    FormsModule,
    RouterLink,
    CurrencyPipe,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss',
})
export class InvoiceListComponent implements OnInit {
  private readonly invoiceService = inject(InvoiceService);
  private readonly auth = inject(AuthService);

  readonly typeOptions = INVOICE_TYPES;
  readonly displayedColumns = ['type', 'description', 'subtotal', 'total', 'createdAt'];
  readonly canCreate = this.auth.hasRole('OPERADOR');

  loading = false;
  loadError = false;
  invoices: InvoiceResponse[] = [];
  totalElements = 0;
  pageIndex = 0;
  pageSize = 10;
  typeFilter: InvoiceType | '' = '';

  ngOnInit(): void {
    this.load();
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.load();
  }

  onFilterChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.loadError = false;
    this.invoiceService
      .list({
        type: this.typeFilter || undefined,
        page: this.pageIndex,
        size: this.pageSize,
      })
      .subscribe({
        next: (page) => {
          this.loading = false;
          this.invoices = page.content;
          this.totalElements = page.totalElements;
        },
        error: () => {
          this.loading = false;
          this.loadError = true;
        },
      });
  }
}
