import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { AuthFormShell } from '../auth-form-shell/auth-form-shell';
import { AuthenticationService } from '../authentication.service';
import { networkOrGenericErrorMessage } from '../authentication-error';
import { PasswordField } from '../password-field/password-field';

/**
 * Shape of an ASP.NET Core `ValidationProblemDetails` response body
 * returned by the backend when request validation fails.
 */
interface ValidationProblemDetails {
  errors?: Record<string, string[]>;
}

/**
 * Registration page. Displays a reactive form for creating a new account
 * and delegates the HTTP call to {@link AuthenticationService}.
 */
@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatError, MatFormField, MatLabel, MatInput, AuthFormShell, PasswordField],
  templateUrl: './register.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Register {
  protected readonly form;
  protected readonly hidePassword = signal(true);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    this.form = this.formBuilder.nonNullable.group(
      {
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]]
      },
      { validators: passwordsMatchValidator }
    );
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

    this.authenticationService.register(username, password).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/login']);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(extractErrorMessage(error));
      }
    });
  }
}

/**
 * Cross-field validator that flags the `confirmPassword` control with a
 * `passwordMismatch` error when its value differs from `password`. Clears
 * the flag once the values align again (e.g. when the user corrects the
 * `password` field, where the confirm control's own validators do not re-run).
 *
 * @param control Form group exposing `password` and `confirmPassword` children.
 * @returns `{ passwordMismatch: true }` when the passwords differ, `null` otherwise.
 */
type RegisterFormGroup = FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

const passwordsMatchValidator = (control: AbstractControl): ValidationErrors | null => {
  const { password, confirmPassword } = (control as RegisterFormGroup).controls;

  if (password.value !== confirmPassword.value && confirmPassword.value !== '') {
    confirmPassword.setErrors({ ...confirmPassword.errors, passwordMismatch: true });
    return { passwordMismatch: true };
  }

  if (confirmPassword.hasError('passwordMismatch')) {
    confirmPassword.setErrors(null);
  }

  return null;
};

const extractErrorMessage = (error: HttpErrorResponse): string => {
  if (error.status === 400) {
    const body = error.error as ValidationProblemDetails | null;
    const errors = body?.errors;
    if (errors) {
      const firstKey = Object.keys(errors)[0];
      const firstMessage = errors[firstKey]?.[0];
      if (firstMessage) {
        return firstMessage;
      }
    }
  }

  return networkOrGenericErrorMessage(error);
};
