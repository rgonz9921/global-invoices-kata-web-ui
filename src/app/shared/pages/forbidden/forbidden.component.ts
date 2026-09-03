import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-forbidden',
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="status-page">
      <h1>403</h1>
      <p>Tu rol no tiene permiso para ver esta seccion.</p>
      <a mat-flat-button color="primary" routerLink="/">Volver al inicio</a>
    </div>
  `,
  styleUrl: './forbidden.component.scss',
})
export class ForbiddenComponent {}
