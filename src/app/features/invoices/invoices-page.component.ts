import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-invoices-page',
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2>Facturas</h2>
        <a mat-flat-button color="primary" routerLink="/invoices/new">
          <mat-icon>add</mat-icon>
          Nueva factura
        </a>
      </div>
      <mat-card>
        <mat-card-content>
          <p>El listado de facturas se construye en el incremento F3.</p>
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
    .page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  `,
})
export class InvoicesPageComponent {}
