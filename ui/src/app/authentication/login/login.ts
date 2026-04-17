import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { AuthFormShell } from '../auth-form-shell/auth-form-shell';
import { AuthenticationService } from '../authentication.service';
import { networkOrGenericErrorMessage } from '../authentication-error';
import { PasswordField } from '../password-field/password-field';

/**
 * Login page. Displays a reactive form for signing in and delegates
 * the HTTP call to {@link AuthenticationService}.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, MatError, MatFormField, MatLabel, MatInput, AuthFormShell, PasswordField],
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.OnPush
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

const extractErrorMessage = (error: HttpErrorResponse): string => {
  if (error.status === 401) {
    return 'Invalid username or password.';
  }

  return networkOrGenericErrorMessage(error);
};
