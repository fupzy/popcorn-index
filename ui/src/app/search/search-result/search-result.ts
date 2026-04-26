import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import { TmdbMovie } from '../search.service';

const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w342';

@Component({
  selector: 'app-search-result',
  imports: [MatProgressSpinner],
  templateUrl: './search-result.html',
  host: {
    class: 'flex flex-col flex-1 h-full w-full'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResult {
  public readonly movies = input<readonly TmdbMovie[]>([]);
  public readonly isLoading = input<boolean>(false);
  public readonly errorMessage = input<string | null>(null);

  protected readonly hasResults = computed(() => this.movies().length > 0);

  protected posterUrl(movie: TmdbMovie): string | null {
    return movie.poster_path !== null ? `${TMDB_POSTER_BASE_URL}${movie.poster_path}` : null;
  }
}
