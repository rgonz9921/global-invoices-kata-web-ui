import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-invoices-page',
  imports: [MatCardModule],
  template: `
    <div class="page">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Facturas</mat-card-title>
          <mat-card-subtitle>Area del rol OPERADOR</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>El formulario de creacion y el listado se construyen en los incrementos F2 y F3.</p>
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
export class InvoicesPageComponent {}
