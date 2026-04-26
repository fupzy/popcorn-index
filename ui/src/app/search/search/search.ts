import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader } from '@angular/material/card';

import { SearchBar, SearchRequest } from '../search-bar/search-bar';
import { SearchResult } from '../search-result/search-result';
import { SearchService, TmdbMedia } from '../search.service';

@Component({
  selector: 'app-search',
  imports: [SearchBar, SearchResult, MatCard, MatCardHeader, MatCardContent],
  templateUrl: './search.html',
  host: {
    class: 'flex flex-col flex-1 h-full w-full min-h-0'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Search {
  protected readonly results = signal<TmdbMedia[]>([]);
  protected readonly isSearching = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  private readonly searchService = inject(SearchService);

  protected onSearch(request: SearchRequest): void {
    if (this.isSearching()) {
      return;
    }

    this.isSearching.set(true);
    this.errorMessage.set(null);

    this.searchService.search(request.query, request.language, request.mediaType).subscribe({
      next: (response) => {
        this.results.set(response.results);
        this.isSearching.set(false);
      },
      error: () => {
        this.results.set([]);
        this.errorMessage.set('Unable to search movies. Please try again.');
        this.isSearching.set(false);
      }
    });
  }
}
