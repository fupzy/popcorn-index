import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { TmdbMedia } from '../search.service';

const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w342';

@Component({
  selector: 'app-search-result',
  imports: [MatProgressSpinner],
  templateUrl: './search-result.html',
  host: {
    class: 'flex flex-col flex-1 h-full w-full min-h-0 overflow-y-auto'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResult {
  public readonly results = input<TmdbMedia[]>([]);
  public readonly isLoading = input<boolean>(false);
  public readonly errorMessage = input<string | null>(null);

  protected readonly hasResults = computed(() => this.results().length > 0);

  protected posterUrl(media: TmdbMedia): string | null {
    return media.poster_path !== null ? `${TMDB_POSTER_BASE_URL}${media.poster_path}` : null;
  }

  protected mediaTypeLabel(media: TmdbMedia): string {
    return media.mediaType === 'movie' ? 'Movie' : 'TV';
  }
}
