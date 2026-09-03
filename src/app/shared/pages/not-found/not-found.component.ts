import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink, MatButtonModule],
  template: `
    <div class="status-page">
      <h1>404</h1>
      <p>La pagina que buscas no existe.</p>
      <a mat-flat-button color="primary" routerLink="/">Volver al inicio</a>
    </div>
  `,
  styles: `
    .status-page {
      max-width: 480px;
      margin: 4rem auto;
      padding: 0 1rem;
      text-align: center;
    }
    .status-page h1 {
      font-size: 4rem;
      margin: 0;
    }
    .status-page p {
      color: rgba(0, 0, 0, 0.6);
      margin: 0.5rem 0 1.5rem;
    }
  `,
})
export class NotFoundComponent {}
