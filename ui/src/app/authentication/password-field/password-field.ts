import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

/**
 * Password input with an optional show/hide visibility toggle. Accepts a
 * `FormControl` directly via `[formControl]` so it does not need to know
 * about its parent form group. Error messages are declared via the
 * `errors` input as a map from validator key to display message; a
 * `<mat-error>` is rendered for each key the control currently reports.
 */
@Component({
  selector: 'app-password-field',
  imports: [ReactiveFormsModule, MatIconButton, MatError, MatFormField, MatLabel, MatInput, MatSuffix],
  templateUrl: './password-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col'
  }
})
export class PasswordField {
  public readonly label = input.required<string>();
  public readonly control = input.required<FormControl<string>>();
  public readonly autocomplete = input.required<string>();
  public readonly hidden = input<boolean>(true);
  public readonly showToggle = input<boolean>(true);
  public readonly errors = input<Record<string, string>>({});
  public readonly visibilityToggle = output<void>();

  /**
   * Active error messages for the current control state — one entry per
   * validator key declared in `errors` that the control currently reports.
   * Re-evaluated on every change detection cycle; reactive forms trigger
   * CD on input events and `MatFormField` propagates `markForCheck` when
   * its control's validity changes, so the template stays in sync.
   */
  protected get visibleErrors(): string[] {
    const control = this.control();

    return Object.entries(this.errors())
      .filter(([key]) => control.hasError(key))
      .map(([, message]) => message);
  }
}
