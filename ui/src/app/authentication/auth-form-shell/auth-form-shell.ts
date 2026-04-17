import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';

/**
 * Shared shell for the authentication pages (sign in / sign up). Renders
 * the form element, page title, error alert, and submit button, while
 * the caller projects the form fields as content children.
 *
 * The form's fields must be bound with `[formControl]` (not
 * `formControlName`) because the caller's projected content does not see
 * the shell's `FormGroupDirective` via dependency injection.
 */
@Component({
  selector: 'app-auth-form-shell',
  imports: [ReactiveFormsModule, MatButton],
  templateUrl: './auth-form-shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-1 items-center justify-center p-4'
  }
})
export class AuthFormShell {
  public readonly form = input.required<FormGroup>();
  public readonly title = input.required<string>();
  public readonly submitLabel = input.required<string>();
  public readonly submitIcon = input.required<string>();
  public readonly submitDisabled = input<boolean>(false);
  public readonly isSubmitting = input<boolean>(false);
  public readonly errorMessage = input<string | null>(null);
  public readonly formSubmit = output<void>();
}
