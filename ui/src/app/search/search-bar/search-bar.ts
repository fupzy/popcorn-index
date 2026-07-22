import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { merge, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

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

const ENGLISH_LANGUAGE: TmdbLanguage = { iso_639_1: 'en', english_name: 'English', name: 'English' };

/**
 * Builds the language list used when TMDB's language endpoint is unavailable:
 * always English, plus the client's own language derived from its locale. Each
 * entry is shaped exactly like a TMDB language (2-letter `iso_639_1` + English
 * and localized display names) so it can be sorted and selected like the real data.
 */
export const buildDefaultLanguages = (locale: string): TmdbLanguage[] => {
  const isoCode = locale.split('-')[0].toLowerCase();

  if (isoCode.length === 0 || isoCode === ENGLISH_LANGUAGE.iso_639_1) {
    return [ENGLISH_LANGUAGE];
  }

  const englishNames = new Intl.DisplayNames(['en'], { type: 'language' });
  const localizedNames = new Intl.DisplayNames([locale], { type: 'language' });

  const clientLanguage: TmdbLanguage = {
    iso_639_1: isoCode,
    english_name: englishNames.of(isoCode) ?? isoCode,
    name: localizedNames.of(isoCode) ?? isoCode
  };

  return [ENGLISH_LANGUAGE, clientLanguage];
};

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
  public readonly queryChanged = output<string>();

  protected readonly form;
  protected readonly languages;
  protected readonly mediaTypeOptions = MEDIA_TYPE_OPTIONS;
  protected readonly searchLabel;

  private readonly formBuilder = inject(FormBuilder);
  private readonly searchService = inject(SearchService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.form = this.formBuilder.nonNullable.group({
      query: ['', [Validators.required, Validators.minLength(1)]],
      language: [DEFAULT_LANGUAGE, [Validators.required]],
      mediaType: [DEFAULT_MEDIA_TYPE, [Validators.required]]
    });

    const defaultLanguages = sortLanguages(buildDefaultLanguages(navigator.language));

    this.languages = toSignal(
      this.searchService.getLanguages().pipe(
        map(sortLanguages),
        catchError(() => of(defaultLanguages))
      ),
      { initialValue: defaultLanguages }
    );
    const mediaType = toSignal(this.form.controls.mediaType.valueChanges, { initialValue: this.form.controls.mediaType.value });
    this.searchLabel = computed(() => SEARCH_LABEL_BY_MEDIA_TYPE[mediaType()]);
  }

  public ngOnInit(): void {
    this.form.setValue({
      query: this.initialQuery(),
      language: this.initialLanguage(),
      mediaType: this.initialMediaType()
    });

    // Re-run the search automatically when the user changes the language or
    // media type, but only once the form holds an actual query. Subscribing
    // after the initial setValue keeps the pre-fill from triggering a search.
    merge(this.form.controls.language.valueChanges, this.form.controls.mediaType.valueChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitSearch());

    // Surface what the user is currently typing so the parent can tell them to
    // submit while the query has not been searched yet.
    this.form.controls.query.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((query) => this.queryChanged.emit(query));
  }

  protected onSubmit(): void {
    this.emitSearch();
  }

  private emitSearch(): void {
    if (this.form.invalid) {
      return;
    }

    const { query, language, mediaType } = this.form.getRawValue();
    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      return;
    }

    this.searchRequested.emit({ query: trimmedQuery, language, mediaType });
  }
}
