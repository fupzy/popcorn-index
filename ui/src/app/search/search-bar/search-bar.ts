import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { map } from 'rxjs/operators';

import { SearchService, TmdbLanguage } from '../search.service';

export const DEFAULT_LANGUAGE = 'fr';

export interface SearchRequest {
  readonly query: string;
  readonly language: string;
}

const EMPTY_LANGUAGES: TmdbLanguage[] = [];

const sortLanguages = (list: TmdbLanguage[]): TmdbLanguage[] =>
  [...list].filter((language) => language.english_name.length > 0).sort((a, b) => a.english_name.localeCompare(b.english_name));

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatIcon, MatIconButton, MatSuffix, MatSelect, MatOption],
  templateUrl: './search-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBar {
  public readonly searchRequested = output<SearchRequest>();

  protected readonly form;
  protected readonly languages;

  private readonly formBuilder = inject(FormBuilder);
  private readonly searchService = inject(SearchService);

  constructor() {
    this.form = this.formBuilder.nonNullable.group({
      query: ['', [Validators.required, Validators.minLength(1)]],
      language: [DEFAULT_LANGUAGE, [Validators.required]]
    });

    this.languages = toSignal(this.searchService.getLanguages().pipe(map(sortLanguages)), { initialValue: EMPTY_LANGUAGES });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { query, language } = this.form.getRawValue();
    this.searchRequested.emit({ query: query.trim(), language });
  }
}
