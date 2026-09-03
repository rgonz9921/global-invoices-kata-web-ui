import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { map } from 'rxjs';
import { DashboardStore } from '@core/dashboard/dashboard.store';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    AsyncPipe,
    CurrencyPipe,
    BaseChartDirective,
    MatCardModule,
    MatButtonModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
})
export class DashboardPageComponent implements OnInit {
  private readonly store = inject(DashboardStore);

  readonly state$ = this.store.state$;
  readonly displayedColumns = ['type', 'invoiceCount', 'totalAmount'];

  readonly chartData$ = this.store.summary$.pipe(
    map(
      (summary): ChartConfiguration<'bar'>['data'] => ({
        labels: (summary?.byType ?? []).map((entry) => entry.type),
        datasets: [
          {
            label: 'Total facturado',
            data: (summary?.byType ?? []).map((entry) => entry.totalAmount),
            backgroundColor: ['#5b8def', '#f2994a', '#27ae60'],
          },
        ],
      }),
    ),
  );

  readonly chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  ngOnInit(): void {
    this.store.load();
  }

  reload(): void {
    this.store.reload();
  }
}
