import { Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, map } from 'rxjs';
import { InvoiceResponse } from '../models/invoice.models';
import { InvoiceEventsService } from '../invoices/invoice-events.service';
import { DashboardService } from './dashboard.service';
import { DashboardSummary } from './dashboard.models';

interface DashboardState {
  summary: DashboardSummary | null;
  loading: boolean;
  error: boolean;
}

const INITIAL: DashboardState = { summary: null, loading: false, error: false };

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  private readonly service = inject(DashboardService);
  private readonly invoiceEvents = inject(InvoiceEventsService);

  private readonly state = new BehaviorSubject<DashboardState>(INITIAL);

  readonly state$ = this.state.asObservable();
  readonly summary$ = this.state$.pipe(map((state) => state.summary));

  constructor() {
    this.invoiceEvents.created$
      .pipe(takeUntilDestroyed())
      .subscribe((invoice) => this.applyInvoice(invoice));
  }

  /** Carga el resumen solo si no hay datos en memoria (no re-consulta al backend). */
  load(): void {
    if (this.state.value.summary || this.state.value.loading) {
      return;
    }
    this.fetch();
  }

  /** Fuerza una nueva consulta al backend. */
  reload(): void {
    this.fetch();
  }

  private fetch(): void {
    this.patch({ loading: true, error: false });
    this.service.getSummary().subscribe({
      next: (summary) => this.patch({ summary, loading: false, error: false }),
      error: () => this.patch({ loading: false, error: true }),
    });
  }

  private applyInvoice(invoice: InvoiceResponse): void {
    const current = this.state.value.summary;
    if (!current) {
      return;
    }
    const byType = current.byType.map((entry) =>
      entry.type === invoice.type
        ? {
            ...entry,
            totalAmount: entry.totalAmount + invoice.totals.total,
            invoiceCount: entry.invoiceCount + 1,
          }
        : entry,
    );
    this.patch({
      summary: {
        byType,
        grandTotal: current.grandTotal + invoice.totals.total,
        totalInvoices: current.totalInvoices + 1,
      },
    });
  }

  private patch(partial: Partial<DashboardState>): void {
    this.state.next({ ...this.state.value, ...partial });
  }
}
