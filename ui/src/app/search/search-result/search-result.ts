import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { getPosterUrl, LoadingShell, PosterWidth } from '@shared';

import { TmdbMedia } from '../search.service';

@Component({
  selector: 'app-search-result',
  imports: [RouterLink, LoadingShell],
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
    return getPosterUrl(media.poster_path, PosterWidth.width342);
  }

  protected mediaTypeLabel(media: TmdbMedia): string {
    return media.mediaType === 'movie' ? 'Movie' : 'TV';
  }
}
