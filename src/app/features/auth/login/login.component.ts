import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '@core/auth/auth.service';
import { landingRouteForRole } from '@core/auth/redirect';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  loading = false;
  errorMessage: string | null = null;

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    if (this.loading) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        void this.router.navigateByUrl(this.resolveTarget());
      },
      error: (error: unknown) => {
        this.loading = false;
        this.errorMessage = this.resolveError(error);
      },
    });
  }

  private resolveTarget(): string {
    const requested = this.route.snapshot.queryParamMap.get('redirect');
    if (requested) {
      return requested;
    }
    const user = this.auth.currentUser;
    return user ? landingRouteForRole(user.role) : '/';
  }

  private resolveError(error: unknown): string {
    const status = (error as { status?: number } | null)?.status;
    if (status === 401) {
      return 'Credenciales invalidas.';
    }
    if (status === 0) {
      return 'No se pudo contactar el servidor. Verifica tu conexion.';
    }
    return 'No se pudo iniciar sesion. Intenta de nuevo.';
  }
}
