import { Injectable, signal } from '@angular/core';

import { DEFAULT_LANGUAGE, DEFAULT_MEDIA_TYPE } from './search-bar/search-bar';
import { MediaTypeFilter, TmdbMedia } from './search.service';

/**
 * Holds the latest search state outside of any component, so that navigating
 * away from the search page and back restores the previous query, the
 * language/media-type filters and the displayed results.
 */
@Injectable({ providedIn: 'root' })
export class SearchStateService {
  public readonly query = signal<string>('');
  public readonly language = signal<string>(DEFAULT_LANGUAGE);
  public readonly mediaType = signal<MediaTypeFilter>(DEFAULT_MEDIA_TYPE);
  public readonly results = signal<TmdbMedia[]>([]);
  public readonly isSearching = signal(false);
  public readonly errorMessage = signal<string | null>(null);
}
