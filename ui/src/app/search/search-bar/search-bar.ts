import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatIcon, MatIconButton, MatSuffix],
  templateUrl: './search-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBar {
  public readonly searchRequested = output<string>();

  protected readonly form;

  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    this.form = this.formBuilder.nonNullable.group({
      query: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { query } = this.form.getRawValue();
    this.searchRequested.emit(query.trim());
  }
}
