import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard-page',
  imports: [MatCardModule],
  template: `
    <div class="page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Dashboard</mat-card-title>
          <mat-card-subtitle>Area del rol AUDITOR</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>La grafica reactiva agrupada por tipo de factura se construye en el incremento F4.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: `
    .page {
      max-width: 720px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
  `,
})
export class DashboardPageComponent {}
