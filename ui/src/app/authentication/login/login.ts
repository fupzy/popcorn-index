import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { AuthenticationService } from '../authentication.service';

/**
 * Login page. Displays a reactive form for signing in and delegates
 * the HTTP call to {@link AuthenticationService}.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatButton, MatIconButton, MatError, MatFormField, MatLabel, MatInput, MatSuffix],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-1 items-center justify-center p-4'
  }
})
export class Login {
  protected readonly form;
  protected readonly hidePassword = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    this.form = this.formBuilder.nonNullable.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.isSubmitting()) {
      return;
    }

    const { username, password } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.authenticationService.login(username, password).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/home']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      }
    });
  }
}

/**
 * Derives a user-facing error message from a failed login response.
 * Returns a credentials hint on HTTP 401, a network hint on status 0,
 * or a generic fallback otherwise.
 */
const extractErrorMessage = (error: HttpErrorResponse): string => {
  if (error.status === 0) {
    return 'Unable to reach the server. Please try again later.';
  }

  if (error.status === 401) {
    return 'Invalid username or password.';
  }

  return 'An unexpected error occurred. Please try again.';
};
