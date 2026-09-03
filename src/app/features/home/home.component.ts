import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, RouterLink, MatCardModule, MatButtonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly auth = inject(AuthService);
  readonly user$ = this.auth.user$;
}
