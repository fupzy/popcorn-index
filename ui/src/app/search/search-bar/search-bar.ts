import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { map } from 'rxjs/operators';

import { MediaTypeFilter, SearchService, TmdbLanguage } from '../search.service';

export const DEFAULT_LANGUAGE = 'fr';
export const DEFAULT_MEDIA_TYPE: MediaTypeFilter = 'all';

export interface SearchRequest {
  readonly query: string;
  readonly language: string;
  readonly mediaType: MediaTypeFilter;
}

export interface MediaTypeOption {
  readonly value: MediaTypeFilter;
  readonly label: string;
}

export const MEDIA_TYPE_OPTIONS: MediaTypeOption[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'Series' }
];

const SEARCH_LABEL_BY_MEDIA_TYPE: Record<MediaTypeFilter, string> = {
  all: 'Search movies & series',
  movie: 'Search a movie',
  tv: 'Search a series'
};

const EMPTY_LANGUAGES: TmdbLanguage[] = [];

const sortLanguages = (list: TmdbLanguage[]): TmdbLanguage[] =>
  [...list].filter((language) => language.english_name.length > 0).sort((a, b) => a.english_name.localeCompare(b.english_name));

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatIcon, MatIconButton, MatSuffix, MatSelect, MatOption],
  templateUrl: './search-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchBar implements OnInit {
  public readonly initialQuery = input<string>('');
  public readonly initialLanguage = input<string>(DEFAULT_LANGUAGE);
  public readonly initialMediaType = input<MediaTypeFilter>(DEFAULT_MEDIA_TYPE);

  public readonly searchRequested = output<SearchRequest>();

  protected readonly form;
  protected readonly languages;
  protected readonly mediaTypeOptions = MEDIA_TYPE_OPTIONS;
  protected readonly searchLabel;

  private readonly formBuilder = inject(FormBuilder);
  private readonly searchService = inject(SearchService);

  constructor() {
    this.form = this.formBuilder.nonNullable.group({
      query: ['', [Validators.required, Validators.minLength(1)]],
      language: [DEFAULT_LANGUAGE, [Validators.required]],
      mediaType: [DEFAULT_MEDIA_TYPE, [Validators.required]]
    });

    this.languages = toSignal(this.searchService.getLanguages().pipe(map(sortLanguages)), { initialValue: EMPTY_LANGUAGES });
    const mediaType = toSignal(this.form.controls.mediaType.valueChanges, { initialValue: this.form.controls.mediaType.value });
    this.searchLabel = computed(() => SEARCH_LABEL_BY_MEDIA_TYPE[mediaType()]);
  }

  public ngOnInit(): void {
    this.form.setValue({
      query: this.initialQuery(),
      language: this.initialLanguage(),
      mediaType: this.initialMediaType()
    });
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { query, language, mediaType } = this.form.getRawValue();
    this.searchRequested.emit({ query: query.trim(), language, mediaType });
  }
}
